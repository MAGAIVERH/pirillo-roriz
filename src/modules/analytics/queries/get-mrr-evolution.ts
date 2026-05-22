import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import {
  getLastNMonthsBounds,
  monthKey,
  monthShortLabel,
} from '../lib/analytics-period';
import type { AnalyticsPeriod, MrrPoint } from '../types/analytics';

export async function getMrrEvolution(
  period: AnalyticsPeriod,
  monthsCount = 6,
): Promise<MrrPoint[]> {
  const academy = await getOrCreateDefaultAcademy();
  const months = getLastNMonthsBounds(period.current, monthsCount);

  const points: MrrPoint[] = [];

  for (const bounds of months) {
    const invoices = await db.invoice.findMany({
      where: {
        academyId: academy.id,
        status: 'PAID',
        paidAt: { gte: bounds.start, lte: bounds.end },
      },
      select: { amountInCents: true, discountInCents: true },
    });

    const valueCents = invoices.reduce(
      (acc, invoice) => acc + invoice.amountInCents - invoice.discountInCents,
      0,
    );

    points.push({
      monthKey: monthKey(bounds.year, bounds.month),
      label: monthShortLabel(bounds.month),
      valueCents,
    });
  }

  return points;
}
