import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { getReservationExpiryDate } from '../lib/store-mappers';
import type {
  ReservationUserType,
  StoreReservation,
  StoreReservationStatus,
} from '../types/store';

function mapOrderStatus(status: string): StoreReservationStatus {
  if (status === 'FULFILLED') {
    return 'fulfilled';
  }

  if (status === 'CANCELED') {
    return 'expired';
  }

  return 'pending';
}

export async function getStoreReservations(): Promise<StoreReservation[]> {
  const academy = await getOrCreateDefaultAcademy();

  const orders = await db.order.findMany({
    where: {
      academyId: academy.id,
      status: { in: ['PENDING', 'FULFILLED'] },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          fullName: true,
        },
      },
      instructor: {
        select: {
          id: true,
          fullName: true,
        },
      },
      items: {
        select: {
          productId: true,
          productNameSnapshot: true,
          quantity: true,
        },
      },
    },
  });

  const reservations: StoreReservation[] = [];

  for (const order of orders) {
    const userType: ReservationUserType = order.instructor ? 'professor' : 'aluno';
    const userId = order.student?.id ?? order.instructor?.id ?? order.id;
    const userName =
      order.student?.fullName ?? order.instructor?.fullName ?? 'Reservante';

    for (const item of order.items) {
      reservations.push({
        id: order.id,
        productId: item.productId,
        productName: item.productNameSnapshot,
        userId,
        userName,
        userType,
        status: mapOrderStatus(order.status),
        quantity: item.quantity,
        createdAt: order.createdAt,
        expiresAt: getReservationExpiryDate(order.createdAt),
      });
    }
  }

  return reservations;
}
