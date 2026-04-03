'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const updateClassCapacitySchema = z.object({
  classId: z.string().min(1, 'Turma inválida.'),
  capacity: z
    .string()
    .min(1, 'Informe a capacidade.')
    .refine((value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= 1;
    }, 'A capacidade deve ser um número inteiro maior que zero.'),
});

type UpdateClassCapacityInput = z.infer<typeof updateClassCapacitySchema>;

export const updateClassCapacityAction = async (
  input: UpdateClassCapacityInput,
) => {
  const parsed = updateClassCapacitySchema.safeParse(input);

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

    await db.class.update({
      where: {
        id: parsed.data.classId,
      },
      data: {
        capacity: Number(parsed.data.capacity),
      },
    });

    revalidatePath('/admin/turmas');
    revalidatePath(`/admin/turmas/${parsed.data.classId}`);

    return {
      success: true,
      message: 'Capacidade atualizada com sucesso.',
    };
  } catch (error) {
    console.error('updateClassCapacityAction error', error);

    return {
      success: false,
      message: 'Não foi possível atualizar a capacidade.',
    };
  }
};
