import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import type { ProductAudience } from '@/generated/prisma/client';

import { releaseExpiredReservations } from '../lib/release-expired-reservations';
import { audienceToVisibility } from '../lib/store-mappers';
import type { StoreVisibility } from '../types/store';

export type StoreCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  availableQuantity: number;
  imageUrl: string | null;
  visibility: StoreVisibility;
  pickupOnly: boolean;
};

type CatalogAudience = 'student' | 'instructor';

const audienceFilter: Record<
  CatalogAudience,
  ProductAudience[]
> = {
  student: ['ALL', 'STUDENTS'],
  instructor: ['ALL', 'INSTRUCTORS'],
};

/** Catálogo para plataformas de aluno ou professor (somente reserva). */
export async function getStoreCatalog(
  audience: CatalogAudience,
): Promise<StoreCatalogItem[]> {
  const academy = await getOrCreateDefaultAcademy();
  await releaseExpiredReservations(academy.id);

  const products = await db.product.findMany({
    where: {
      academyId: academy.id,
      active: true,
      stockQuantity: { gt: 0 },
      audience: { in: audienceFilter[audience] },
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      priceInCents: true,
      stockQuantity: true,
      imageUrl: true,
      audience: true,
      pickupOnly: true,
    },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    priceCents: product.priceInCents,
    availableQuantity: product.stockQuantity,
    imageUrl: product.imageUrl,
    visibility: audienceToVisibility(product.audience),
    pickupOnly: product.pickupOnly,
  }));
}
