import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { releaseExpiredReservations } from '../lib/release-expired-reservations';
import { parseProductImageUrls } from '../lib/parse-product-images';
import {
  audienceToVisibility,
  getReservationExpiryDate,
} from '../lib/store-mappers';
import type {
  ReservationUserType,
  StorePendingReserver,
  StoreProduct,
} from '../types/store';

function resolveReserverName(order: {
  student: { id: string; fullName: string } | null;
  instructor: { id: string; fullName: string } | null;
}): { name: string; userType: ReservationUserType; userId: string } {
  if (order.student) {
    return {
      name: order.student.fullName,
      userType: 'aluno',
      userId: order.student.id,
    };
  }

  if (order.instructor) {
    return {
      name: order.instructor.fullName,
      userType: 'professor',
      userId: order.instructor.id,
    };
  }

  return {
    name: 'Reservante',
    userType: 'aluno',
    userId: 'unknown',
  };
}

export async function getStoreProducts(): Promise<StoreProduct[]> {
  const academy = await getOrCreateDefaultAcademy();
  await releaseExpiredReservations(academy.id);

  const [products, pendingOrders] = await Promise.all([
    db.product.findMany({
      where: { academyId: academy.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        priceInCents: true,
        stockQuantity: true,
        imageUrl: true,
        galleryUrls: true,
        audience: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    db.order.findMany({
      where: {
        academyId: academy.id,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
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
            quantity: true,
          },
        },
      },
    }),
  ]);

  const reservedByProduct = new Map<string, number>();
  const reserversByProduct = new Map<string, StorePendingReserver[]>();

  for (const order of pendingOrders) {
    const reserver = resolveReserverName(order);
    const expiresAt = getReservationExpiryDate(order.createdAt);

    for (const item of order.items) {
      reservedByProduct.set(
        item.productId,
        (reservedByProduct.get(item.productId) ?? 0) + item.quantity,
      );

      const list = reserversByProduct.get(item.productId) ?? [];
      list.push({
        orderId: order.id,
        name: reserver.name,
        userType: reserver.userType,
        reservedAt: order.createdAt,
        expiresAt,
      });
      reserversByProduct.set(item.productId, list);
    }
  }

  return products.map((product) => {
    const reservedQuantity = reservedByProduct.get(product.id) ?? 0;
    const availableQuantity = product.stockQuantity;
    const imageUrls = parseProductImageUrls(product.imageUrl, product.galleryUrls);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.priceInCents,
      stockQuantity: product.stockQuantity,
      reservedQuantity,
      availableQuantity,
      imageUrl: imageUrls[0] ?? null,
      imageUrls,
      visibility: audienceToVisibility(product.audience),
      active: product.active,
      pendingReservers: reserversByProduct.get(product.id) ?? [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  });
}
