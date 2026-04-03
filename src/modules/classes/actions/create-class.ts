'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const createClassSchema = z.object({
  name: z.string().min(3, 'O nome da turma deve ter pelo menos 3 caracteres.'),
  classTypeId: z.string().min(1, 'Selecione o tipo da turma.'),
  capacity: z.string().optional(),
});

type CreateClassInput = z.infer<typeof createClassSchema>;

export const createClassAction = async (input: CreateClassInput) => {
  const parsed = createClassSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const classType = await db.classType.findFirst({
      where: {
        id: parsed.data.classTypeId,
        academyId: academy.id,
      },
      select: {
        id: true,
      },
    });

    if (!classType) {
      return {
        success: false,
        message: 'Tipo de turma não encontrado.',
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

    const createdClass = await db.class.create({
      data: {
        academyId: academy.id,
        name: parsed.data.name,
        classTypeId: parsed.data.classTypeId,
        capacity: normalizedCapacity ? Number(normalizedCapacity) : null,
        active: true,
      },
      select: {
        id: true,
      },
    });

    revalidatePath('/admin/turmas');

    redirect(`/admin/turmas/${createdClass.id}`);
  } catch (error) {
    console.error('createClassAction error', error);

    return {
      success: false,
      message: 'Não foi possível criar a turma.',
    };
  }
};
