import { db } from '@/lib/db';

import { toProductSlug } from './store-mappers';

export async function buildUniqueProductSlug(
  academyId: string,
  name: string,
  excludeProductId?: string,
) {
  const baseSlug = toProductSlug(name) || 'produto';
  let slug = baseSlug;
  let suffix = 1;

  while (true) {
    const existing = await db.product.findFirst({
      where: {
        academyId,
        slug,
        ...(excludeProductId ? { id: { not: excludeProductId } } : {}),
      },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }

    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
}
