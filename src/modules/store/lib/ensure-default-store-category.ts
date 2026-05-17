import { db } from '@/lib/db';

import {
  DEFAULT_STORE_CATEGORY_NAME,
  DEFAULT_STORE_CATEGORY_SLUG,
} from './store-constants';

export async function ensureDefaultStoreCategory(academyId: string) {
  const existing = await db.productCategory.findFirst({
    where: {
      academyId,
      slug: DEFAULT_STORE_CATEGORY_SLUG,
    },
    select: { id: true },
  });

  if (existing) {
    return existing;
  }

  return db.productCategory.create({
    data: {
      academyId,
      name: DEFAULT_STORE_CATEGORY_NAME,
      slug: DEFAULT_STORE_CATEGORY_SLUG,
      active: true,
    },
    select: { id: true },
  });
}
