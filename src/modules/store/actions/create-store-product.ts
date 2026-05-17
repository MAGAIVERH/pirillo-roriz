'use server';

import { revalidatePath } from 'next/cache';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { buildUniqueProductSlug } from '../lib/build-unique-product-slug';
import { ensureDefaultStoreCategory } from '../lib/ensure-default-store-category';
import { visibilityToAudience } from '../lib/store-mappers';
import {
  storeProductSchema,
  type StoreProductInput,
} from '../schemas/store-product-schema';

type ActionResult = { success: boolean; message: string };

export async function createStoreProductAction(
  input: StoreProductInput,
): Promise<ActionResult> {
  const parsed = storeProductSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();
    const category = await ensureDefaultStoreCategory(academy.id);
    const slug = await buildUniqueProductSlug(academy.id, parsed.data.name);
    const imageUrl = parsed.data.imageUrl?.trim() || null;

    await db.product.create({
      data: {
        academyId: academy.id,
        categoryId: category.id,
        name: parsed.data.name.trim(),
        slug,
        description: parsed.data.description?.trim() || null,
        priceInCents: parsed.data.priceCents,
        stockQuantity: parsed.data.stockQuantity,
        imageUrl,
        audience: visibilityToAudience(parsed.data.visibility),
        pickupOnly: true,
        active: true,
      },
    });

    revalidatePath('/admin/loja');

    return {
      success: true,
      message: 'Produto cadastrado com sucesso.',
    };
  } catch (error) {
    console.error('createStoreProductAction error', error);

    return {
      success: false,
      message: 'Não foi possível cadastrar o produto.',
    };
  }
}
