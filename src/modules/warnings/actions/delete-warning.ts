'use server';

import { revalidatePath } from 'next/cache';

import { assertAdminAction } from '@/lib/admin-action';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

type ActionResult = { success: boolean; message: string };

export async function deleteWarningAction(
  warningId: string,
): Promise<ActionResult> {
  const auth = await assertAdminAction();
  if (!auth.success) {
    return { success: false, message: auth.message };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const existing = await db.announcement.findFirst({
      where: { id: warningId, academyId: academy.id },
      select: { id: true },
    });

    if (!existing) {
      return {
        success: false,
        message: 'Aviso não encontrado.',
      };
    }

    await db.announcement.delete({
      where: { id: warningId },
    });

    revalidatePath('/admin/avisos');
    revalidatePath('/professor/avisos');

    return {
      success: true,
      message: 'Aviso removido com sucesso.',
    };
  } catch (error) {
    console.error('deleteWarningAction error', error);

    return {
      success: false,
      message: 'Não foi possível remover o aviso.',
    };
  }
}
