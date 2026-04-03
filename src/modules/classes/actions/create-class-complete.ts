'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { WeekDay } from '@/generated/prisma/client';

const scheduleSchema = z.object({
  weekDay: z.nativeEnum(WeekDay, {
    error: 'Selecione o dia da semana.',
  }),
  startTime: z.string().min(1, 'Informe a hora inicial.'),
  endTime: z.string().min(1, 'Informe a hora final.'),
});

const createClassCompleteSchema = z.object({
  name: z.string().min(3, 'O nome da turma deve ter pelo menos 3 caracteres.'),
  classTypeName: z
    .string()
    .min(2, 'O tipo da turma deve ter pelo menos 2 caracteres.'),
  capacity: z.string().optional(),
  instructorId: z.string().optional(),
  schedules: z
    .array(scheduleSchema)
    .min(1, 'Cadastre pelo menos um horário para a turma.'),
});

type CreateClassCompleteInput = z.infer<typeof createClassCompleteSchema>;

export const createClassCompleteAction = async (
  input: CreateClassCompleteInput,
) => {
  const parsed = createClassCompleteSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

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

    const instructorId = parsed.data.instructorId?.trim() || null;

    const createdClass = await db.class.create({
      data: {
        academyId: academy.id,
        name: parsed.data.name.trim(),
        classTypeId: classType.id,
        capacity: normalizedCapacity ? Number(normalizedCapacity) : null,
        instructorId,
        active: true,
        schedules: {
          create: parsed.data.schedules.map((schedule) => ({
            weekDay: schedule.weekDay,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          })),
        },
      },
      select: {
        id: true,
      },
    });

    revalidatePath('/admin/turmas');
    revalidatePath(`/admin/turmas/${createdClass.id}`);

    return {
      success: true,
      message: 'Turma criada com sucesso.',
      classId: createdClass.id,
    };
  } catch (error) {
    console.error('createClassCompleteAction error', error);

    return {
      success: false,
      message: 'Não foi possível criar a turma.',
    };
  }
};
