import { db } from '@/lib/db';

import { STORE_RESERVATION_EXPIRY_MS } from './store-constants';

export async function releaseExpiredReservations(academyId: string) {
  const cutoff = new Date(Date.now() - STORE_RESERVATION_EXPIRY_MS);

  const expiredOrders = await db.order.findMany({
    where: {
      academyId,
      status: 'PENDING',
      createdAt: { lt: cutoff },
    },
    select: {
      id: true,
      items: {
        select: {
          productId: true,
          quantity: true,
        },
      },
    },
  });

  if (expiredOrders.length === 0) {
    return 0;
  }

  await db.$transaction(async (tx) => {
    for (const order of expiredOrders) {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stockQuantity: { increment: item.quantity },
          },
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: 'CANCELED' },
      });
    }
  });

  return expiredOrders.length;
}
