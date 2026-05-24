'use server';

import { revalidatePath } from 'next/cache';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { getWarningAuthorUserId } from '../lib/get-warning-author-user-id';
import { parseWarningDates } from '../lib/parse-warning-dates';
import {
  visibilityToScope,
  warningTypeToPrisma,
} from '../lib/warning-mappers';
import { warningSchema, type WarningInput } from '../schemas/warning-schema';

type ActionResult = { success: boolean; message: string };

export async function createWarningAction(
  input: WarningInput,
): Promise<ActionResult> {
  const parsed = warningSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();
    const authorUserId = await getWarningAuthorUserId();
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

    await db.announcement.create({
      data: {
        academyId: academy.id,
        title: parsed.data.title.trim(),
        content: parsed.data.content.trim(),
        type: warningTypeToPrisma(parsed.data.type),
        visibilityScope: visibilityToScope(parsed.data.visibility),
        publishedAt,
        expiresAt,
        createdByUserId: authorUserId,
      },
    });

    revalidatePath('/admin/avisos');
    revalidatePath('/professor/avisos');

    return {
      success: true,
      message: publishedAt
        ? 'Aviso publicado com sucesso.'
        : 'Rascunho salvo com sucesso.',
    };
  } catch (error) {
    console.error('createWarningAction error', error);

    return {
      success: false,
      message: 'Não foi possível criar o aviso.',
    };
  }
}
