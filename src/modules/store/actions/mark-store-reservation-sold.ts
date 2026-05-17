'use server';

import { revalidatePath } from 'next/cache';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

type ActionResult = { success: boolean; message: string };

export async function markStoreReservationSoldAction(
  orderId: string,
): Promise<ActionResult> {
  try {
    const academy = await getOrCreateDefaultAcademy();

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        academyId: academy.id,
        status: 'PENDING',
      },
      select: { id: true },
    });

    if (!order) {
      return {
        success: false,
        message: 'Reserva não encontrada ou já finalizada.',
      };
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        status: 'FULFILLED',
        pickupStatus: 'PICKED_UP',
        pickedUpAt: new Date(),
      },
    });

    revalidatePath('/admin/loja');

    return {
      success: true,
      message: 'Reserva marcada como vendida.',
    };
  } catch (error) {
    console.error('markStoreReservationSoldAction error', error);

    return {
      success: false,
      message: 'Não foi possível marcar a reserva como vendida.',
    };
  }
}
