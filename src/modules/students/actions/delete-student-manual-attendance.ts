'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { db } from '@/lib/db';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { calculateStudentProgress } from '../lib/calcule-student-progress';

const deleteStudentManualAttendanceSchema = z.object({
  studentId: z.string().min(1, 'Aluno inválido.'),
  attendanceId: z.string().min(1, 'Lançamento inválido.'),
});

type DeleteStudentManualAttendanceInput = z.infer<
  typeof deleteStudentManualAttendanceSchema
>;

export const deleteStudentManualAttendanceAction = async (
  input: DeleteStudentManualAttendanceInput,
) => {
  const parsed = deleteStudentManualAttendanceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const attendance = await db.attendance.findFirst({
      where: {
        id: parsed.data.attendanceId,
        studentId: parsed.data.studentId,
        student: {
          academyId: academy.id,
        },
      },
      select: {
        id: true,
        studentId: true,
      },
    });

    if (!attendance) {
      return {
        success: false,
        message: 'Lançamento de presença não encontrado.',
      };
    }

    await db.attendance.delete({
      where: {
        id: attendance.id,
      },
    });

    await calculateStudentProgress(attendance.studentId);

    revalidatePath(`/admin/alunos/${attendance.studentId}`);

    return {
      success: true,
      message: 'Lançamento removido com sucesso.',
    };
  } catch (error) {
    console.error('deleteStudentManualAttendanceAction error', error);

    return {
      success: false,
      message: 'Não foi possível remover o lançamento.',
    };
  }
};
