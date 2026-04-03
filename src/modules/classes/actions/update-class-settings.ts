'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const updateClassSettingsSchema = z.object({
  classId: z.string().min(1, 'Turma inválida.'),
  name: z.string().min(3, 'O nome da turma deve ter pelo menos 3 caracteres.'),
  classTypeName: z
    .string()
    .min(2, 'O tipo da turma deve ter pelo menos 2 caracteres.'),
  capacity: z.string().optional(),
});

type UpdateClassSettingsInput = z.infer<typeof updateClassSettingsSchema>;

export const updateClassSettingsAction = async (
  input: UpdateClassSettingsInput,
) => {
  const parsed = updateClassSettingsSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const foundClass = await db.class.findFirst({
      where: {
        id: parsed.data.classId,
        academyId: academy.id,
      },
      select: {
        id: true,
      },
    });

    if (!foundClass) {
      return {
        success: false,
        message: 'Turma não encontrada.',
      };
    }

    const normalizedCapacity = parsed.data.capacity?.trim() ?? '';

    if (normalizedCapacity) {
      const numericCapacity = Number(normalizedCapacity);

      if (!Number.isInteger(numericCapacity) || numericCapacity < 1) {
        return {
          success: false,
          message: 'A capacidade deve ser um número inteiro maior que zero.',
        };
      }
    }

    const normalizedTypeName = parsed.data.classTypeName.trim();

    let classType = await db.classType.findFirst({
      where: {
        academyId: academy.id,
        name: normalizedTypeName,
      },
      select: {
        id: true,
      },
    });

    if (!classType) {
      classType = await db.classType.create({
        data: {
          academyId: academy.id,
          name: normalizedTypeName,
          level: 'ALL_LEVELS',
        },
        select: {
          id: true,
        },
      });
    }

    await db.class.update({
      where: {
        id: parsed.data.classId,
      },
      data: {
        name: parsed.data.name.trim(),
        classTypeId: classType.id,
        capacity: normalizedCapacity ? Number(normalizedCapacity) : null,
      },
    });

    revalidatePath('/admin/turmas');
    revalidatePath(`/admin/turmas/${parsed.data.classId}`);

    return {
      success: true,
      message: 'Configurações da turma atualizadas com sucesso.',
    };
  } catch (error) {
    console.error('updateClassSettingsAction error', error);

    return {
      success: false,
      message: 'Não foi possível atualizar a turma.',
    };
  }
};
