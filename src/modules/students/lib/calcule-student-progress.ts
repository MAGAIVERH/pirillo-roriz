import {
  GraduationProgram,
  ProgressStatus,
  type GraduationRule,
  type StudentProgress,
} from '@/generated/prisma/client';
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

export type StudentProgressComputation = {
  program: GraduationProgram;
  projectedEligibilityDate: Date;
  status: ProgressStatus;
  attendancesSincePromotion: number;
  absencesSincePromotion: number;
  lastAttendanceAt: Date | null;
};

export type StudentProgressSuccess = {
  success: true;
  progress: StudentProgress;
  rule: GraduationRule;
  baseDate: Date;
  currentBeltName: string;
  currentDegreeNumber: number | null;
};

export type StudentProgressFailure = {
  success: false;
  message: string;
};

export type StudentProgressResult = StudentProgressSuccess | StudentProgressFailure;

async function computeStudentProgressData(studentId: string): Promise<
  | {
      success: true;
      studentId: string;
      academyId: string;
      computation: StudentProgressComputation;
      rule: GraduationRule;
      baseDate: Date;
      currentBeltName: string;
      currentDegreeNumber: number | null;
    }
  | StudentProgressFailure
> {
  const academy = await getOrCreateDefaultAcademy();

  const student = await db.student.findFirst({
    where: {
      id: studentId,
      academyId: academy.id,
    },
    select: {
      id: true,
      birthDate: true,
      joinDate: true,
      createdAt: true,
      beltStatus: {
        select: {
          promotedAt: true,
          currentBeltId: true,
          currentDegreeId: true,
          currentBelt: {
            select: {
              name: true,
              juvenileCategory: true,
            },
          },
          currentDegree: {
            select: {
              degreeNumber: true,
            },
          },
        },
      },
      graduationHistory: {
        orderBy: {
          promotedAt: 'desc',
        },
        take: 1,
        select: {
          promotedAt: true,
        },
      },
      attendances: {
        select: {
          status: true,
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
      success: false,
      message: 'Aluno ou faixa atual não encontrados.',
    };
  }

  const currentBelt = student.beltStatus.currentBelt;

  const program = currentBelt.juvenileCategory
    ? GraduationProgram.KIDS
    : GraduationProgram.ADULT;

  const latestGraduationDate = student.graduationHistory[0]?.promotedAt ?? null;

  const baseDateRaw =
    latestGraduationDate ??
    student.beltStatus.promotedAt ??
    student.joinDate ??
    student.createdAt;

  const baseDate = startOfDayUtc(baseDateRaw);
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
              { minAge: null },
              { minAge: { lte: referenceAge ?? 0 } },
            ],
          }
        : {}),
    },
    orderBy: [{ minAge: 'asc' }, { displayOrder: 'asc' }],
  });

  if (!matchingRule) {
    return {
      success: false,
      message: 'Nenhuma regra de graduação compatível foi encontrada.',
    };
  }

  const attendancesSinceBase = student.attendances.filter(
    (attendance) => attendance.classSession.sessionDate >= baseDate,
  );

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

  return {
    success: true,
    studentId: student.id,
    academyId: academy.id,
    computation: {
      program,
      projectedEligibilityDate,
      status,
      attendancesSincePromotion,
      absencesSincePromotion,
      lastAttendanceAt: lastAttendance?.classSession.sessionDate ?? null,
    },
    rule: matchingRule,
    baseDate,
    currentBeltName: currentBelt.name,
    currentDegreeNumber: student.beltStatus.currentDegree?.degreeNumber ?? null,
  };
}

export async function getStudentProgressSnapshot(
  studentId: string,
): Promise<StudentProgressResult> {
  const computed = await computeStudentProgressData(studentId);

  if (!computed.success) {
    return computed;
  }

  const existing = await db.studentProgress.findFirst({
    where: {
      studentId: computed.studentId,
      academyId: computed.academyId,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      lastRecalculatedAt: true,
    },
  });

  const now = new Date();

  const progress: StudentProgress = {
    id: existing?.id ?? computed.studentId,
    academyId: computed.academyId,
    studentId: computed.studentId,
    notes: null,
    ...computed.computation,
    lastRecalculatedAt: existing?.lastRecalculatedAt ?? now,
    createdAt: existing?.createdAt ?? now,
    updatedAt: existing?.updatedAt ?? now,
  };

  return {
    success: true,
    progress,
    rule: computed.rule,
    baseDate: computed.baseDate,
    currentBeltName: computed.currentBeltName,
    currentDegreeNumber: computed.currentDegreeNumber,
  };
}

export const calculateStudentProgress = async (
  studentId: string,
): Promise<StudentProgressResult> => {
  const computed = await computeStudentProgressData(studentId);

  if (!computed.success) {
    return computed;
  }

  const progress = await db.studentProgress.upsert({
    where: {
      studentId: computed.studentId,
    },
    update: {
      academyId: computed.academyId,
      ...computed.computation,
      lastRecalculatedAt: new Date(),
    },
    create: {
      academyId: computed.academyId,
      studentId: computed.studentId,
      ...computed.computation,
      lastRecalculatedAt: new Date(),
    },
  });

  return {
    success: true,
    progress,
    rule: computed.rule,
    baseDate: computed.baseDate,
    currentBeltName: computed.currentBeltName,
    currentDegreeNumber: computed.currentDegreeNumber,
  };
};
