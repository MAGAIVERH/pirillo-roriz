'use server';

import { revalidatePath } from 'next/cache';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

type ActionResult = { success: boolean; message: string };

type CreateStoreReservationInput = {
  productId: string;
  studentId?: string;
  instructorId?: string;
  quantity?: number;
};

export async function createStoreReservationAction(
  input: CreateStoreReservationInput,
): Promise<ActionResult> {
  const quantity = input.quantity ?? 1;

  if (!input.studentId && !input.instructorId) {
    return {
      success: false,
      message: 'Informe o aluno ou professor que está reservando.',
    };
  }

  if (input.studentId && input.instructorId) {
    return {
      success: false,
      message: 'Reserva inválida: informe apenas aluno ou professor.',
    };
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    return {
      success: false,
      message: 'Quantidade inválida.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const product = await db.product.findFirst({
      where: {
        id: input.productId,
        academyId: academy.id,
        active: true,
      },
      select: {
        id: true,
        name: true,
        priceInCents: true,
        stockQuantity: true,
        pickupOnly: true,
      },
    });

    if (!product) {
      return {
        success: false,
        message: 'Produto não encontrado.',
      };
    }

    if (product.stockQuantity < quantity) {
      return {
        success: false,
        message: 'Produto sem estoque disponível.',
      };
    }

    const lineTotal = product.priceInCents * quantity;

    await db.$transaction(async (tx) => {
      const updated = await tx.product.updateMany({
        where: {
          id: product.id,
          stockQuantity: { gte: quantity },
        },
        data: {
          stockQuantity: { decrement: quantity },
        },
      });

      if (updated.count === 0) {
        throw new Error('STOCK_UNAVAILABLE');
      }

      await tx.order.create({
        data: {
          academyId: academy.id,
          studentId: input.studentId ?? null,
          instructorId: input.instructorId ?? null,
          status: 'PENDING',
          subtotalInCents: lineTotal,
          totalInCents: lineTotal,
          pickupStatus: 'WAITING_SEPARATION',
          items: {
            create: {
              productId: product.id,
              productNameSnapshot: product.name,
              unitPriceInCents: product.priceInCents,
              quantity,
              lineTotalInCents: lineTotal,
            },
          },
        },
      });
    });

    revalidatePath('/admin/loja');

    return {
      success: true,
      message: 'Produto reservado para retirada na academia.',
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'STOCK_UNAVAILABLE') {
      return {
        success: false,
        message: 'Produto sem estoque disponível.',
      };
    }

    console.error('createStoreReservationAction error', error);

    return {
      success: false,
      message: 'Não foi possível reservar o produto.',
    };
  }
}
