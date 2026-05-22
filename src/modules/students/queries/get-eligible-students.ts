import { GraduationProgram } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type EligibleStudent = {
  studentId: string;
  fullName: string;
  currentBeltName: string;
  currentDegreeNumber: number | null;
  nextBeltName: string;
  nextDegreeNumber: number | null;
  projectedEligibilityDate: string | null;
  attendancesSincePromotion: number;
};

type EligibilityRow = {
  studentId: string;
  projectedEligibilityDate: Date | null;
  attendancesSincePromotion: number;
  student: {
    fullName: string;
    birthDate: Date | null;
    beltStatus: {
      currentBeltId: string;
      currentDegreeId: string | null;
      currentBelt: { name: string; juvenileCategory: boolean };
      currentDegree: { degreeNumber: number } | null;
    } | null;
  };
};

async function resolveEligibleStudent(
  academyId: string,
  row: EligibilityRow,
): Promise<EligibleStudent | null> {
  const beltStatus = row.student.beltStatus;
  if (!beltStatus) return null;

  const program = beltStatus.currentBelt.juvenileCategory
    ? GraduationProgram.KIDS
    : GraduationProgram.ADULT;

  const age = calculateAge(row.student.birthDate);

  const matchingRule = await db.graduationRule.findFirst({
    where: {
      academyId,
      active: true,
      program,
      currentBeltId: beltStatus.currentBeltId,
      currentDegreeId: beltStatus.currentDegreeId ?? null,
      ...(program === GraduationProgram.KIDS && age !== null
        ? { OR: [{ minAge: null }, { minAge: { lte: age } }] }
        : {}),
    },
    orderBy: [{ minAge: 'asc' }, { displayOrder: 'asc' }],
    select: {
      nextBelt: { select: { name: true } },
      nextDegree: { select: { degreeNumber: true } },
    },
  });

  if (!matchingRule) return null;

  return {
    studentId: row.studentId,
    fullName: row.student.fullName,
    currentBeltName: beltStatus.currentBelt.name,
    currentDegreeNumber: beltStatus.currentDegree?.degreeNumber ?? null,
    nextBeltName: matchingRule.nextBelt.name,
    nextDegreeNumber: matchingRule.nextDegree?.degreeNumber ?? null,
    projectedEligibilityDate: row.projectedEligibilityDate
      ? row.projectedEligibilityDate.toLocaleDateString('pt-BR')
      : null,
    attendancesSincePromotion: row.attendancesSincePromotion,
  };
}

function calculateAge(birthDate: Date | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
}

const eligibilitySelect = {
  studentId: true,
  projectedEligibilityDate: true,
  attendancesSincePromotion: true,
  student: {
    select: {
      fullName: true,
      birthDate: true,
      beltStatus: {
        select: {
          currentBeltId: true,
          currentDegreeId: true,
          currentBelt: {
            select: { name: true, juvenileCategory: true },
          },
          currentDegree: { select: { degreeNumber: true } },
        },
      },
    },
  },
} as const;

export async function getEligibleStudents(): Promise<EligibleStudent[]> {
  const academy = await getOrCreateDefaultAcademy();

  const rows = await db.studentProgress.findMany({
    where: {
      academyId: academy.id,
      status: 'ELIGIBLE',
      student: { status: 'ACTIVE' },
    },
    select: eligibilitySelect,
  });

  const results: EligibleStudent[] = [];

  for (const row of rows) {
    const resolved = await resolveEligibleStudent(academy.id, row);
    if (resolved) results.push(resolved);
  }

  return results.sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function getStudentEligibility(
  studentId: string,
): Promise<EligibleStudent | null> {
  const academy = await getOrCreateDefaultAcademy();

  const row = await db.studentProgress.findFirst({
    where: {
      academyId: academy.id,
      studentId,
      status: 'ELIGIBLE',
      student: { status: 'ACTIVE' },
    },
    select: eligibilitySelect,
  });

  if (!row) return null;

  return resolveEligibleStudent(academy.id, row);
}
