'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { requireInstructorContext } from '@/lib/session-context';

const deleteInstructorWarningSchema = z.object({
  warningId: z.string().min(1, 'Aviso inválido.'),
});

type ActionResult = { success: boolean; message: string };

export async function deleteInstructorWarningAction(
  input: unknown,
): Promise<ActionResult> {
  const parsed = deleteInstructorWarningSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const { user } = await requireInstructorContext();
    const academy = await getOrCreateDefaultAcademy();

    const warning = await db.announcement.findFirst({
      where: {
        id: parsed.data.warningId,
        academyId: academy.id,
        createdByUserId: user.id,
        visibilityScope: 'CLASS_ONLY',
      },
      select: {
        id: true,
      },
    });

    if (!warning) {
      return {
        success: false,
        message: 'Aviso não encontrado ou sem permissão para remover.',
      };
    }

    await db.announcement.delete({
      where: {
        id: warning.id,
      },
    });

    revalidatePath('/professor/avisos');

    return {
      success: true,
      message: 'Aviso removido com sucesso.',
    };
  } catch (error) {
    console.error('deleteInstructorWarningAction error', error);

    return {
      success: false,
      message: 'Não foi possível remover o aviso.',
    };
  }
}
