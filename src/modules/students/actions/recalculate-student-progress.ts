'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { calculateStudentProgress } from '../lib/calcule-student-progress';

const recalculateStudentProgressSchema = z.object({
  studentId: z.string().min(1, 'Aluno inválido.'),
});

type RecalculateStudentProgressInput = z.infer<
  typeof recalculateStudentProgressSchema
>;

export const recalculateStudentProgressAction = async (
  input: RecalculateStudentProgressInput,
) => {
  const parsed = recalculateStudentProgressSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  const result = await calculateStudentProgress(parsed.data.studentId);

  if (!result.success) {
    return {
      success: false,
      message: result.message,
    };
  }

  revalidatePath(`/admin/alunos/${parsed.data.studentId}`);

  return {
    success: true,
    message: 'Progresso do aluno recalculado com sucesso.',
  };
};
