import { db } from '@/lib/db';

type FindPersonByEmailResult = {
  hasStudent: boolean;
  hasInstructor: boolean;
  studentId?: string;
  instructorId?: string;
};

/**
 * Verifica se um email já está vinculado a um aluno ou professor
 * dentro da academia. Usado para permitir dual role (mesma pessoa
 * como professor e aluno) e bloquear duplicatas dentro do mesmo papel.
 */
export async function findPersonByEmail(
  academyId: string,
  email: string,
): Promise<FindPersonByEmailResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const [student, instructor] = await Promise.all([
    db.student.findFirst({
      where: { academyId, email: normalizedEmail },
      select: { id: true },
    }),
    db.instructor.findFirst({
      where: { academyId, email: normalizedEmail },
      select: { id: true },
    }),
  ]);

  return {
    hasStudent: Boolean(student),
    hasInstructor: Boolean(instructor),
    studentId: student?.id,
    instructorId: instructor?.id,
  };
}
