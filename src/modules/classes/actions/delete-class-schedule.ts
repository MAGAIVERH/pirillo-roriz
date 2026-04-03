'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/lib/db';

const deleteClassScheduleSchema = z.object({
  scheduleId: z.string().min(1, 'Horário inválido.'),
  classId: z.string().min(1, 'Turma inválida.'),
});

type DeleteClassScheduleInput = z.infer<typeof deleteClassScheduleSchema>;

export const deleteClassScheduleAction = async (
  input: DeleteClassScheduleInput,
) => {
  const parsed = deleteClassScheduleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    await db.classSchedule.delete({
      where: {
        id: parsed.data.scheduleId,
      },
    });

    revalidatePath('/admin/turmas');
    revalidatePath(`/admin/turmas/${parsed.data.classId}`);

    return {
      success: true,
      message: 'Horário removido com sucesso.',
    };
  } catch (error) {
    console.error('deleteClassScheduleAction error', error);

    return {
      success: false,
      message: 'Não foi possível remover o horário.',
    };
  }
};
