'use server';

import { revalidatePath } from 'next/cache';

import { AppRole, StudentStatus } from '@/generated/prisma/client';
import { assertAdminAction } from '@/lib/admin-action';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { getAuthUserId } from '@/lib/get-auth-user-id';
import { provisionUserAccount } from '@/modules/users/lib/provision-user-account';

import { changeStudentStatus } from '../lib/student-status-helpers';
import {
  updateStudentStatusSchema,
  type UpdateStudentStatusInput,
} from '../schemas/update-student-status-schema';

type UpdateStudentStatusResult = {
  success: boolean;
  message: string;
};

const ACCESS_STATUSES: StudentStatus[] = [
  StudentStatus.ACTIVE,
  StudentStatus.TRIAL,
];

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

  const auth = await assertAdminAction();
  if (!auth.success) {
    return { success: false, message: auth.message };
  }

  const { studentId, toStatus, reasonId, notes } = parsed.data;

  try {
    const academy = await getOrCreateDefaultAcademy();

    const student = await db.student.findFirst({
      where: { id: studentId, academyId: academy.id },
      select: {
        id: true,
        status: true,
        userId: true,
        fullName: true,
        email: true,
      },
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

    const shouldProvisionAccess =
      !student.userId &&
      ACCESS_STATUSES.includes(toStatus) &&
      Boolean(student.email?.trim());

    let provisioningMessage = '';

    if (shouldProvisionAccess && student.email) {
      const provisioning = await provisionUserAccount({
        fullName: student.fullName,
        email: student.email,
        academyId: academy.id,
        role: AppRole.STUDENT,
        portalPath: '/aluno',
        welcomeRole: 'STUDENT',
      });

      if (!provisioning.success) {
        return {
          success: false,
          message:
            provisioning.message ??
            'Não foi possível criar o acesso do aluno.',
        };
      }

      await db.student.update({
        where: { id: student.id },
        data: { userId: provisioning.userId },
      });

      if (provisioning.reusedExisting && provisioning.roleAdded) {
        provisioningMessage = provisioning.emailSent
          ? ' Acesso de aluno liberado com o login existente — email de confirmação enviado.'
          : ' Acesso de aluno liberado com o login existente, mas o email não pôde ser enviado.';
      } else if (provisioning.reusedExisting) {
        provisioningMessage =
          ' Acesso vinculado à conta existente com o mesmo login e senha.';
      } else if (provisioning.emailSent) {
        provisioningMessage = ' Email com acesso provisório enviado.';
      } else {
        provisioningMessage =
          ' Acesso criado, mas o email de boas-vindas não pôde ser enviado.';
      }
    }

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

    return {
      success: true,
      message: `Status atualizado com sucesso.${provisioningMessage}`,
    };
  } catch (error) {
    console.error('updateStudentStatusAction error', error);
    return {
      success: false,
      message: 'Não foi possível atualizar o status do aluno.',
    };
  }
}
