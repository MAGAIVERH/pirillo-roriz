import { notFound } from 'next/navigation';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export const getGraduationRuleById = async (ruleId: string) => {
  const academy = await getOrCreateDefaultAcademy();

  const rule = await db.graduationRule.findFirst({
    where: {
      id: ruleId,
      academyId: academy.id,
    },
    include: {
      currentBelt: {
        include: {
          degrees: {
            orderBy: {
              degreeNumber: 'asc',
            },
            select: {
              id: true,
              degreeNumber: true,
            },
          },
        },
      },
      currentDegree: {
        select: {
          id: true,
          degreeNumber: true,
        },
      },
      nextBelt: {
        include: {
          degrees: {
            orderBy: {
              degreeNumber: 'asc',
            },
            select: {
              id: true,
              degreeNumber: true,
            },
          },
        },
      },
      nextDegree: {
        select: {
          id: true,
          degreeNumber: true,
        },
      },
    },
  });

  if (!rule) {
    notFound();
  }

  const belts = await db.belt.findMany({
    where: {
      academyId: academy.id,
      active: true,
    },
    include: {
      degrees: {
        orderBy: {
          degreeNumber: 'asc',
        },
        select: {
          id: true,
          degreeNumber: true,
        },
      },
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return {
    rule: {
      id: rule.id,
      program: rule.program,
      currentBeltId: rule.currentBeltId,
      currentDegreeId: rule.currentDegreeId ?? '',
      nextBeltId: rule.nextBeltId,
      nextDegreeId: rule.nextDegreeId ?? '',
      minimumMonths: String(rule.minimumMonths),
      minimumAge: rule.minAge !== null ? String(rule.minAge) : '',
      status: (rule.active ? 'ACTIVE' : 'INACTIVE') as 'ACTIVE' | 'INACTIVE',
      currentStepLabel: rule.currentDegree
        ? `${rule.currentBelt.name} • Grau ${rule.currentDegree.degreeNumber}`
        : rule.currentBelt.name,
      nextStepLabel: rule.nextDegree
        ? `${rule.nextBelt.name} • Grau ${rule.nextDegree.degreeNumber}`
        : rule.nextBelt.name,
    },
    belts: belts.map((belt) => ({
      id: belt.id,
      name: belt.name,
      color: belt.color,
      sortOrder: belt.sortOrder,
      adultCategory: belt.adultCategory,
      juvenileCategory: belt.juvenileCategory,
      degrees: belt.degrees.map((degree) => ({
        id: degree.id,
        degreeNumber: degree.degreeNumber,
      })),
    })),
  };
};
