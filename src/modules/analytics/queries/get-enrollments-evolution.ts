import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import {
  getLastNMonthsBounds,
  monthKey,
  monthShortLabel,
} from '../lib/analytics-period';
import type {
  AnalyticsPeriod,
  EnrollmentsPoint,
} from '../types/analytics';

export async function getEnrollmentsEvolution(
  period: AnalyticsPeriod,
  monthsCount = 6,
): Promise<EnrollmentsPoint[]> {
  const academy = await getOrCreateDefaultAcademy();
  const months = getLastNMonthsBounds(period.current, monthsCount);

  const points: EnrollmentsPoint[] = [];

  for (const bounds of months) {
    const [entries, exits] = await Promise.all([
      db.student.count({
        where: {
          academyId: academy.id,
          joinDate: { gte: bounds.start, lte: bounds.end },
        },
      }),
      db.studentStatusHistory.count({
        where: {
          student: { academyId: academy.id },
          toStatus: { in: ['CANCELED', 'INACTIVE'] },
          changedAt: { gte: bounds.start, lte: bounds.end },
        },
      }),
    ]);

    points.push({
      monthKey: monthKey(bounds.year, bounds.month),
      label: monthShortLabel(bounds.month),
      entries,
      exits,
      net: entries - exits,
    });
  }

  return points;
}
