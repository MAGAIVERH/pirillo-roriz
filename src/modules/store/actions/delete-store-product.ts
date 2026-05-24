'use server';

import { revalidatePath } from 'next/cache';

import { assertAdminAction } from '@/lib/admin-action';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

type ActionResult = { success: boolean; message: string };

export async function deleteStoreProductAction(
  productId: string,
): Promise<ActionResult> {
  const auth = await assertAdminAction();
  if (!auth.success) {
    return { success: false, message: auth.message };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const existing = await db.product.findFirst({
      where: { id: productId, academyId: academy.id },
      select: { id: true },
    });

    if (!existing) {
      return {
        success: false,
        message: 'Produto não encontrado.',
      };
    }

    const pendingReservation = await db.order.count({
      where: {
        academyId: academy.id,
        status: 'PENDING',
        items: { some: { productId } },
      },
    });

    if (pendingReservation > 0) {
      return {
        success: false,
        message:
          'Não é possível remover um produto com reservas pendentes. Marque como vendido ou aguarde a expiração.',
      };
    }

    await db.product.update({
      where: { id: productId },
      data: { active: false },
    });

    revalidatePath('/admin/loja');

    return {
      success: true,
      message: 'Produto removido da loja.',
    };
  } catch (error) {
    console.error('deleteStoreProductAction error', error);

    return {
      success: false,
      message: 'Não foi possível remover o produto.',
    };
  }
}
