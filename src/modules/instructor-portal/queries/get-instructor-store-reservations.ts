import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { getReservationExpiryDate } from '@/modules/store/lib/store-mappers';
import { releaseExpiredReservations } from '@/modules/store/lib/release-expired-reservations';
import type { StoreReservationStatus } from '@/modules/store/types/store';

export type InstructorStoreReservationItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  totalCents: number;
  status: StoreReservationStatus;
  createdAt: Date;
  expiresAt: Date;
};

function mapOrderStatus(status: string): StoreReservationStatus {
  if (status === 'FULFILLED') {
    return 'fulfilled';
  }

  if (status === 'CANCELED') {
    return 'expired';
  }

  return 'pending';
}

export async function getInstructorStoreReservations(
  instructorId: string,
): Promise<InstructorStoreReservationItem[]> {
  const academy = await getOrCreateDefaultAcademy();
  await releaseExpiredReservations(academy.id);

  const orders = await db.order.findMany({
    where: {
      academyId: academy.id,
      instructorId,
      status: { in: ['PENDING', 'FULFILLED'] },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      createdAt: true,
      totalInCents: true,
      items: {
        select: {
          productId: true,
          productNameSnapshot: true,
          quantity: true,
          lineTotalInCents: true,
        },
      },
    },
  });

  const reservations: InstructorStoreReservationItem[] = [];

  for (const order of orders) {
    for (const item of order.items) {
      reservations.push({
        id: order.id,
        productId: item.productId,
        productName: item.productNameSnapshot,
        quantity: item.quantity,
        totalCents: item.lineTotalInCents,
        status: mapOrderStatus(order.status),
        createdAt: order.createdAt,
        expiresAt: getReservationExpiryDate(order.createdAt),
      });
    }
  }

  return reservations;
}
