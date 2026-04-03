import { GraduationProgram } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type GraduationRuleListItem = {
  id: string;
  program: GraduationProgram;
  currentStep: string;
  nextStep: string;
  minimumMonths: number;
  minimumAge: string;
  active: boolean;
};

const formatStep = (
  beltName: string,
  degreeNumber: number | null | undefined,
) => {
  if (!degreeNumber) {
    return beltName;
  }

  return `${beltName} • Grau ${degreeNumber}`;
};

export const getGraduationRulesList = async (): Promise<
  GraduationRuleListItem[]
> => {
  const academy = await getOrCreateDefaultAcademy();

  const rules = await db.graduationRule.findMany({
    where: {
      academyId: academy.id,
    },
    include: {
      currentBelt: {
        select: {
          name: true,
        },
      },
      currentDegree: {
        select: {
          degreeNumber: true,
        },
      },
      nextBelt: {
        select: {
          name: true,
        },
      },
      nextDegree: {
        select: {
          degreeNumber: true,
        },
      },
    },
    orderBy: [
      { program: 'asc' },
      { displayOrder: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  return rules.map((rule) => ({
    id: rule.id,
    program: rule.program,
    currentStep: formatStep(
      rule.currentBelt.name,
      rule.currentDegree?.degreeNumber,
    ),
    nextStep: formatStep(rule.nextBelt.name, rule.nextDegree?.degreeNumber),
    minimumMonths: rule.minimumMonths,
    minimumAge:
      rule.program === 'KIDS' && rule.minAge !== null
        ? `${rule.minAge} anos`
        : '-',
    active: rule.active,
  }));
};
