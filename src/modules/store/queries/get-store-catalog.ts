import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import type { ProductAudience } from '@/generated/prisma/client';

import { parseProductImageUrls } from '../lib/parse-product-images';
import { audienceToVisibility } from '../lib/store-mappers';
import type { StoreVisibility } from '../types/store';

export type StoreCatalogItem = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  availableQuantity: number;
  imageUrl: string | null;
  imageUrls: string[];
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
      galleryUrls: true,
      audience: true,
      pickupOnly: true,
    },
  });

  return products.map((product) => {
    const imageUrls = parseProductImageUrls(product.imageUrl, product.galleryUrls);

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      priceCents: product.priceInCents,
      availableQuantity: product.stockQuantity,
      imageUrl: imageUrls[0] ?? null,
      imageUrls,
      visibility: audienceToVisibility(product.audience),
      pickupOnly: product.pickupOnly,
    };
  });
}
