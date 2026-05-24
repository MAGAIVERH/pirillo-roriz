'use server';

import { revalidatePath } from 'next/cache';

import { assertAdminAction } from '@/lib/admin-action';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { parseWarningDates } from '../lib/parse-warning-dates';
import {
  visibilityToScope,
  warningTypeToPrisma,
} from '../lib/warning-mappers';
import { warningSchema, type WarningInput } from '../schemas/warning-schema';

type ActionResult = { success: boolean; message: string };

export async function updateWarningAction(
  warningId: string,
  input: WarningInput,
): Promise<ActionResult> {
  const parsed = warningSchema.safeParse(input);

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

    const { publishedAt, expiresAt } = parseWarningDates(parsed.data);

    if (
      publishedAt &&
      expiresAt &&
      expiresAt.getTime() <= publishedAt.getTime()
    ) {
      return {
        success: false,
        message: 'A data de expiração deve ser posterior à publicação.',
      };
    }

    await db.announcement.update({
      where: { id: warningId },
      data: {
        title: parsed.data.title.trim(),
        content: parsed.data.content.trim(),
        type: warningTypeToPrisma(parsed.data.type),
        visibilityScope: visibilityToScope(parsed.data.visibility),
        publishedAt,
        expiresAt,
      },
    });

    revalidatePath('/admin/avisos');
    revalidatePath('/professor/avisos');

    return {
      success: true,
      message: 'Aviso atualizado com sucesso.',
    };
  } catch (error) {
    console.error('updateWarningAction error', error);

    return {
      success: false,
      message: 'Não foi possível atualizar o aviso.',
    };
  }
}
