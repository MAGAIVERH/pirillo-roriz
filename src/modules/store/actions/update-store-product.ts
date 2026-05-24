'use server';

import { revalidatePath } from 'next/cache';

import { assertAdminAction } from '@/lib/admin-action';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { buildUniqueProductSlug } from '../lib/build-unique-product-slug';
import { resolveProductImagePayload } from '../lib/resolve-product-image-payload';
import { visibilityToAudience } from '../lib/store-mappers';
import {
  storeProductSchema,
  type StoreProductInput,
} from '../schemas/store-product-schema';

type ActionResult = { success: boolean; message: string };

export async function updateStoreProductAction(
  productId: string,
  input: StoreProductInput,
): Promise<ActionResult> {
  const parsed = storeProductSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  const auth = await assertAdminAction();
  if (!auth.success) {
    return { success: false, message: auth.message };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const existing = await db.product.findFirst({
      where: { id: productId, academyId: academy.id },
      select: { id: true, name: true },
    });

    if (!existing) {
      return {
        success: false,
        message: 'Produto não encontrado.',
      };
    }

    const normalizedName = parsed.data.name.trim();
    const slug =
      normalizedName !== existing.name
        ? await buildUniqueProductSlug(academy.id, normalizedName, productId)
        : undefined;

    const { imageUrl, galleryUrls } = resolveProductImagePayload(parsed.data);

    await db.product.update({
      where: { id: productId },
      data: {
        name: normalizedName,
        ...(slug ? { slug } : {}),
        description: parsed.data.description?.trim() || null,
        priceInCents: parsed.data.priceCents,
        stockQuantity: parsed.data.stockQuantity,
        imageUrl,
        galleryUrls,
        audience: visibilityToAudience(parsed.data.visibility),
      },
    });

    revalidatePath('/admin/loja');

    return {
      success: true,
      message: 'Produto atualizado com sucesso.',
    };
  } catch (error) {
    console.error('updateStoreProductAction error', error);

    return {
      success: false,
      message: 'Não foi possível atualizar o produto.',
    };
  }
}
