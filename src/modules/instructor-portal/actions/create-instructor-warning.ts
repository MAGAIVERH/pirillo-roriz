'use server';

import { revalidatePath } from 'next/cache';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { requireInstructorContext } from '@/lib/session-context';
import type { InstructorWarningInput } from '@/modules/instructor-portal/schemas/instructor-warning-schema';
import { instructorWarningSchema } from '@/modules/instructor-portal/schemas/instructor-warning-schema';
import { warningTypeToPrisma } from '@/modules/warnings/lib/warning-mappers';

type ActionResult = { success: boolean; message: string };

export async function createInstructorWarningAction(
  input: InstructorWarningInput,
): Promise<ActionResult> {
  const parsed = instructorWarningSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const { user, instructor } = await requireInstructorContext();
    const academy = await getOrCreateDefaultAcademy();

    const instructorClasses = await db.class.findMany({
      where: {
        academyId: academy.id,
        instructorId: instructor.id,
        active: true,
      },
      select: {
        id: true,
      },
    });

    if (instructorClasses.length === 0) {
      return {
        success: false,
        message: 'Você não possui turmas ativas para enviar avisos.',
      };
    }

    let targetClassIds: string[];

    if (parsed.data.audience === 'class') {
      const ownsClass = instructorClasses.some(
        (classItem) => classItem.id === parsed.data.classId,
      );

      if (!ownsClass) {
        return {
          success: false,
          message: 'Turma inválida ou sem permissão.',
        };
      }

      targetClassIds = [parsed.data.classId!];
    } else {
      targetClassIds = instructorClasses.map((classItem) => classItem.id);
    }

    let expiresAt: Date | null = null;

    if (parsed.data.expiresAt?.trim()) {
      const parsedExpiry = new Date(parsed.data.expiresAt);
      if (!Number.isNaN(parsedExpiry.getTime())) {
        expiresAt = parsedExpiry;
      }
    }

    if (expiresAt && expiresAt.getTime() <= Date.now()) {
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
        visibilityScope: 'CLASS_ONLY',
        publishedAt: new Date(),
        expiresAt,
        createdByUserId: user.id,
        targets: {
          create: targetClassIds.map((classId) => ({
            classId,
          })),
        },
      },
    });

    revalidatePath('/professor/avisos');

    return {
      success: true,
      message: 'Aviso enviado para seus alunos com sucesso.',
    };
  } catch (error) {
    console.error('createInstructorWarningAction error', error);

    return {
      success: false,
      message: 'Não foi possível enviar o aviso.',
    };
  }
}
