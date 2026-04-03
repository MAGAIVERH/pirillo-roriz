import { GraduationProgram, ProgressStatus } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const addMonths = (date: Date, months: number) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

const startOfDayUtc = (date: Date) => {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
};

const getStudentAge = (birthDate: Date | null, referenceDate: Date) => {
  if (!birthDate) {
    return null;
  }

  let age = referenceDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = referenceDate.getUTCMonth() - birthDate.getUTCMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getUTCDate() < birthDate.getUTCDate())
  ) {
    age -= 1;
  }

  return age;
};

export const calculateStudentProgress = async (studentId: string) => {
  const academy = await getOrCreateDefaultAcademy();

  const student = await db.student.findFirst({
    where: {
      id: studentId,
      academyId: academy.id,
    },
    include: {
      beltStatus: {
        include: {
          currentBelt: true,
          currentDegree: true,
        },
      },
      graduationHistory: {
        orderBy: {
          promotedAt: 'desc',
        },
        take: 1,
      },
      attendances: {
        include: {
          classSession: {
            select: {
              sessionDate: true,
            },
          },
        },
        orderBy: {
          classSession: {
            sessionDate: 'desc',
          },
        },
      },
    },
  });

  if (!student || !student.beltStatus) {
    return {
      success: false as const,
      message: 'Aluno ou faixa atual não encontrados.',
    };
  }

  const currentBelt = student.beltStatus.currentBelt;

  const program = currentBelt.juvenileCategory
    ? GraduationProgram.KIDS
    : GraduationProgram.ADULT;

  const latestGraduationDate = student.graduationHistory[0]?.promotedAt ?? null;

  const baseDate =
    latestGraduationDate ??
    student.beltStatus.promotedAt ??
    student.joinDate ??
    student.createdAt;

  const referenceAge = getStudentAge(student.birthDate, new Date());

  const matchingRule = await db.graduationRule.findFirst({
    where: {
      academyId: academy.id,
      active: true,
      program,
      currentBeltId: student.beltStatus.currentBeltId,
      currentDegreeId: student.beltStatus.currentDegreeId ?? null,
      ...(program === GraduationProgram.KIDS
        ? {
            OR: [
              {
                minAge: null,
              },
              {
                minAge: {
                  lte: referenceAge ?? 0,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [
      {
        minAge: 'asc',
      },
      {
        displayOrder: 'asc',
      },
    ],
  });

  if (!matchingRule) {
    return {
      success: false as const,
      message: 'Nenhuma regra de graduação compatível foi encontrada.',
    };
  }

  const attendancesSinceBase = student.attendances.filter((attendance) => {
    return attendance.classSession.sessionDate >= baseDate;
  });

  const presentStatuses = new Set(['PRESENT', 'LATE']);
  const absenceStatuses = new Set(['ABSENT']);

  const attendancesSincePromotion = attendancesSinceBase.filter((attendance) =>
    presentStatuses.has(attendance.status),
  ).length;

  const absencesSincePromotion = attendancesSinceBase.filter((attendance) =>
    absenceStatuses.has(attendance.status),
  ).length;

  const lastAttendance = attendancesSinceBase.find((attendance) =>
    presentStatuses.has(attendance.status),
  );

  const projectedEligibilityDate = addMonths(
    startOfDayUtc(baseDate),
    matchingRule.minimumMonths,
  );

  const today = startOfDayUtc(new Date());

  let status: ProgressStatus = ProgressStatus.ON_TRACK;

  if (
    today >= projectedEligibilityDate &&
    attendancesSincePromotion >= matchingRule.minimumAttendances
  ) {
    status = ProgressStatus.ELIGIBLE;
  } else if (
    today >= projectedEligibilityDate &&
    attendancesSincePromotion < matchingRule.minimumAttendances
  ) {
    status = ProgressStatus.POSTPONED;
  }

  const progress = await db.studentProgress.upsert({
    where: {
      studentId: student.id,
    },
    update: {
      academyId: academy.id,
      program,
      projectedEligibilityDate,
      status,
      attendancesSincePromotion,
      absencesSincePromotion,
      lastAttendanceAt: lastAttendance?.classSession.sessionDate ?? null,
      lastRecalculatedAt: new Date(),
    },
    create: {
      academyId: academy.id,
      studentId: student.id,
      program,
      projectedEligibilityDate,
      status,
      attendancesSincePromotion,
      absencesSincePromotion,
      lastAttendanceAt: lastAttendance?.classSession.sessionDate ?? null,
      lastRecalculatedAt: new Date(),
    },
  });

  return {
    success: true as const,
    progress,
    rule: matchingRule,
    baseDate,
    currentBeltName: currentBelt.name,
    currentDegreeNumber: student.beltStatus.currentDegree?.degreeNumber ?? null,
  };
};
