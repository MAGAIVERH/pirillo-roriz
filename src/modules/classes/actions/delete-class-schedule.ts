'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { assertAdminAction } from '@/lib/admin-action';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
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

  const auth = await assertAdminAction();
  if (!auth.success) {
    return { success: false, message: auth.message };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const schedule = await db.classSchedule.findFirst({
      where: {
        id: parsed.data.scheduleId,
        class: {
          academyId: academy.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (!schedule) {
      return {
        success: false,
        message: 'Horário não encontrado.',
      };
    }

    await db.classSchedule.delete({
      where: {
        id: schedule.id,
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
