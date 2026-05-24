'use server';

import { revalidatePath } from 'next/cache';

import { assertAdminAction } from '@/lib/admin-action';
import { runStudentDelinquencySync } from '@/modules/students/lib/sync-student-delinquency-core';

type SyncResult = {
  success: boolean;
  message: string;
  promotedToDelinquent: number;
  restoredToActive: number;
};

export async function syncStudentDelinquencyStatus(
  studentId?: string,
): Promise<SyncResult> {
  const auth = await assertAdminAction();

  if (!auth.success) {
    return {
      success: false,
      message: auth.message,
      promotedToDelinquent: 0,
      restoredToActive: 0,
    };
  }

  const result = await runStudentDelinquencySync(studentId);

  if (
    result.success &&
    (result.promotedToDelinquent > 0 || result.restoredToActive > 0)
  ) {
    revalidatePath('/admin');
    revalidatePath('/admin/alunos');
    revalidatePath('/admin/analytics');
    revalidatePath('/admin/financeiro');
  }

  return result;
}
