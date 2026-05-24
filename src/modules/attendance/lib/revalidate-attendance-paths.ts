import { revalidatePath } from 'next/cache';

export function revalidateAttendancePaths(studentId: string): void {
  revalidatePath('/professor');
  revalidatePath('/professor/qr-code');
  revalidatePath('/professor/turmas');
  revalidatePath(`/professor/alunos/${studentId}`);
  revalidatePath(`/admin/alunos/${studentId}`);
  revalidatePath('/aluno');
  revalidatePath('/admin/analytics');
}
