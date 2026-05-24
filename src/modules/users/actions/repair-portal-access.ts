'use server';

import { revalidatePath } from 'next/cache';

import { assertAdminAction } from '@/lib/admin-action';
import { repairAllPortalAccess } from '@/modules/users/lib/repair-portal-access';

type RepairPortalAccessActionResult = {
  success: boolean;
  message: string;
  studentsLinked?: number;
  instructorsLinked?: number;
  failures?: string[];
};

export async function repairPortalAccessAction(): Promise<RepairPortalAccessActionResult> {
  const auth = await assertAdminAction();

  if (!auth.success) {
    return { success: false, message: auth.message };
  }

  const result = await repairAllPortalAccess();

  revalidatePath('/admin/alunos');
  revalidatePath('/admin/professores');

  return {
    success: result.success,
    message:
      result.failures.length > 0
        ? `${result.message} Falhas: ${result.failures.join(' · ')}`
        : result.message,
    studentsLinked: result.studentsLinked,
    instructorsLinked: result.instructorsLinked,
    failures: result.failures,
  };
}
