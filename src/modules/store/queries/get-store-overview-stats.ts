import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import type { StoreOverviewStats } from '../types/store';

export async function getStoreOverviewStats(): Promise<StoreOverviewStats> {
  const academy = await getOrCreateDefaultAcademy();

  const [totalProducts, stockAggregate, pendingReservations, products] =
    await Promise.all([
      db.product.count({
        where: { academyId: academy.id, active: true },
      }),
      db.product.aggregate({
        where: { academyId: academy.id, active: true },
        _sum: { stockQuantity: true },
      }),
      db.order.count({
        where: { academyId: academy.id, status: 'PENDING' },
      }),
      db.product.findMany({
        where: { academyId: academy.id, active: true },
        select: {
          id: true,
          stockQuantity: true,
        },
      }),
    ]);

  const outOfStock = products.filter(
    (product) => product.stockQuantity <= 0,
  ).length;

  return {
    totalProducts,
    totalStock: stockAggregate._sum.stockQuantity ?? 0,
    pendingReservations,
    outOfStock,
  };
}
