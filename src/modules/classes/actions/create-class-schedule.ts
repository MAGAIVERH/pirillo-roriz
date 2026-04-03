'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { WeekDay } from '@/generated/prisma/client';

const createClassScheduleSchema = z.object({
  classId: z.string().min(1, 'Turma inválida.'),
  weekDay: z.nativeEnum(WeekDay, {
    error: 'Selecione o dia da semana.',
  }),
  startTime: z.string().min(1, 'Informe o horário inicial.'),
  endTime: z.string().min(1, 'Informe o horário final.'),
});

type CreateClassScheduleInput = z.infer<typeof createClassScheduleSchema>;

export const createClassScheduleAction = async (
  input: CreateClassScheduleInput,
) => {
  const parsed = createClassScheduleSchema.safeParse(input);

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

    await db.classSchedule.create({
      data: {
        classId: parsed.data.classId,
        weekDay: parsed.data.weekDay,
        startTime: parsed.data.startTime,
        endTime: parsed.data.endTime,
      },
    });

    revalidatePath('/admin/turmas');
    revalidatePath(`/admin/turmas/${parsed.data.classId}`);

    return {
      success: true,
      message: 'Horário cadastrado com sucesso.',
    };
  } catch (error) {
    console.error('createClassScheduleAction error', error);

    return {
      success: false,
      message: 'Não foi possível cadastrar o horário.',
    };
  }
};
