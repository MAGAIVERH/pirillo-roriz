'use server';

import { revalidatePath } from 'next/cache';

import { assertAdminAction } from '@/lib/admin-action';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { calculateStudentProgress } from '../lib/calcule-student-progress';

type RecalculateAllProgressResult = {
  success: boolean;
  message: string;
  recalculated: number;
};

export async function recalculateAllProgressAction(): Promise<RecalculateAllProgressResult> {
  const auth = await assertAdminAction();
  if (!auth.success) {
    return {
      success: false,
      message: auth.message,
      recalculated: 0,
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const students = await db.student.findMany({
      where: {
        academyId: academy.id,
        status: 'ACTIVE',
        beltStatus: { isNot: null },
      },
      select: { id: true },
    });

    const BATCH_SIZE = 10;
    let success = 0;

    for (let i = 0; i < students.length; i += BATCH_SIZE) {
      const batch = students.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((student) => calculateStudentProgress(student.id)),
      );
      success += results.filter((result) => result.success).length;
    }

    revalidatePath('/admin');
    revalidatePath('/admin/alunos');
    revalidatePath('/admin/analytics');

    return {
      success: true,
      message: `${success} aluno(s) tiveram o progresso recalculado.`,
      recalculated: success,
    };
  } catch (error) {
    console.error('recalculateAllProgressAction error', error);
    return {
      success: false,
      message: 'Não foi possível recalcular os progressos.',
      recalculated: 0,
    };
  }
}
