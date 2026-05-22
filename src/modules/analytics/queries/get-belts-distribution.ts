import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import type { BeltDistributionEntry } from '../types/analytics';

export async function getBeltsDistribution(): Promise<BeltDistributionEntry[]> {
  const academy = await getOrCreateDefaultAcademy();

  const [belts, beltStatuses, eligibleProgress] = await Promise.all([
    db.belt.findMany({
      where: { academyId: academy.id, active: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        color: true,
        sortOrder: true,
      },
    }),
    db.studentBeltStatus.findMany({
      where: { student: { academyId: academy.id, status: 'ACTIVE' } },
      select: {
        studentId: true,
        currentBeltId: true,
      },
    }),
    db.studentProgress.findMany({
      where: {
        academyId: academy.id,
        status: 'ELIGIBLE',
        student: { status: 'ACTIVE' },
      },
      select: { studentId: true },
    }),
  ]);

  const eligibleStudentIds = new Set(
    eligibleProgress.map((entry) => entry.studentId),
  );

  return belts.map((belt) => {
    const statusesOfBelt = beltStatuses.filter(
      (entry) => entry.currentBeltId === belt.id,
    );

    const eligible = statusesOfBelt.filter((entry) =>
      eligibleStudentIds.has(entry.studentId),
    ).length;

    return {
      beltId: belt.id,
      beltName: belt.name,
      beltColor: belt.color,
      sortOrder: belt.sortOrder,
      students: statusesOfBelt.length,
      eligibleForPromotion: eligible,
    };
  });
}
