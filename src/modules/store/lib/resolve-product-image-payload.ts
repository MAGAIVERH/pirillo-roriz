import { Prisma } from '@/generated/prisma/client';

import type { StoreProductInput } from '../schemas/store-product-schema';

export function resolveProductImagePayload(input: StoreProductInput): {
  imageUrl: string | null;
  galleryUrls: Prisma.InputJsonValue | typeof Prisma.DbNull;
} {
  const fromArray =
    input.imageUrls?.map((url) => url.trim()).filter((url) => url.length > 0) ??
    [];

  const fromSingle = input.imageUrl?.trim() ? [input.imageUrl.trim()] : [];
  const imageUrls = fromArray.length > 0 ? fromArray : fromSingle;

  return {
    imageUrl: imageUrls[0] ?? null,
    galleryUrls: imageUrls.length > 0 ? imageUrls : Prisma.DbNull,
  };
}
