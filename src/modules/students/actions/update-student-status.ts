'use server';

import { revalidatePath } from 'next/cache';

import { StudentStatus } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { getAuthUserId } from '@/lib/get-auth-user-id';

import { changeStudentStatus } from '../lib/student-status-helpers';
import {
  updateStudentStatusSchema,
  type UpdateStudentStatusInput,
} from '../schemas/update-student-status-schema';

type UpdateStudentStatusResult = {
  success: boolean;
  message: string;
};

export async function updateStudentStatusAction(
  input: UpdateStudentStatusInput,
): Promise<UpdateStudentStatusResult> {
  const parsed = updateStudentStatusSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  const { studentId, toStatus, reasonId, notes } = parsed.data;

  try {
    const academy = await getOrCreateDefaultAcademy();

    const student = await db.student.findFirst({
      where: { id: studentId, academyId: academy.id },
      select: { id: true, status: true },
    });

    if (!student) {
      return { success: false, message: 'Aluno não encontrado.' };
    }

    if (student.status === toStatus) {
      return { success: false, message: 'O aluno já está nesse status.' };
    }

    let resolvedReasonId: string | null = null;
    if (toStatus === StudentStatus.CANCELED && reasonId) {
      const reason = await db.cancellationReason.findFirst({
        where: { id: reasonId, academyId: academy.id, active: true },
        select: { id: true },
      });

      if (!reason) {
        return { success: false, message: 'Motivo de cancelamento inválido.' };
      }

      resolvedReasonId = reason.id;
    }

    const changedByUserId = await getAuthUserId();

    await changeStudentStatus({
      studentId,
      fromStatus: student.status,
      toStatus,
      reasonId: resolvedReasonId,
      notes: notes?.trim() || null,
      changedByUserId: changedByUserId ?? null,
    });

    revalidatePath('/admin');
    revalidatePath('/admin/alunos');
    revalidatePath(`/admin/alunos/${studentId}`);
    revalidatePath('/admin/analytics');

    return { success: true, message: 'Status atualizado com sucesso.' };
  } catch (error) {
    console.error('updateStudentStatusAction error', error);
    return {
      success: false,
      message: 'Não foi possível atualizar o status do aluno.',
    };
  }
}
