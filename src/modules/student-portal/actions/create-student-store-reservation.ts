'use server';

import { revalidatePath } from 'next/cache';

import { ProductAudience } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { requireStudentContext } from '@/lib/session-context';
import {
  studentStoreReservationSchema,
  type StudentStoreReservationInput,
} from '@/modules/student-portal/schemas/student-store-reservation-schema';

type ActionResult = { success: boolean; message: string };

const studentAudience: ProductAudience[] = ['ALL', 'STUDENTS'];

export async function createStudentStoreReservationAction(
  input: StudentStoreReservationInput,
): Promise<ActionResult> {
  const parsed = studentStoreReservationSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  const quantity = parsed.data.quantity ?? 1;

  try {
    const { student } = await requireStudentContext();
    const academy = await getOrCreateDefaultAcademy();

    const product = await db.product.findFirst({
      where: {
        id: parsed.data.productId,
        academyId: academy.id,
        active: true,
        audience: { in: studentAudience },
      },
      select: {
        id: true,
        name: true,
        priceInCents: true,
        stockQuantity: true,
      },
    });

    if (!product) {
      return {
        success: false,
        message: 'Produto não encontrado ou indisponível para você.',
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
          studentId: student.id,
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

    revalidatePath('/aluno/loja');
    revalidatePath('/admin/loja');

    return {
      success: true,
      message: 'Produto reservado. Retire na academia em até 2 dias.',
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'STOCK_UNAVAILABLE') {
      return {
        success: false,
        message: 'Produto sem estoque disponível.',
      };
    }

    console.error('createStudentStoreReservationAction error', error);

    return {
      success: false,
      message: 'Não foi possível reservar o produto.',
    };
  }
}
