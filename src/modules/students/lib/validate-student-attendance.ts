import { StudentStatus } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

type AttendanceValidationResult =
  | { allowed: true }
  | { allowed: false; message: string };

export async function validateStudentCanReceiveAttendance(
  studentId: string,
  options?: { blockDelinquent?: boolean },
): Promise<AttendanceValidationResult> {
  const blockDelinquent = options?.blockDelinquent ?? false;
  const academy = await getOrCreateDefaultAcademy();

  const student = await db.student.findFirst({
    where: {
      id: studentId,
      academyId: academy.id,
    },
    select: {
      id: true,
      status: true,
      fullName: true,
    },
  });

  if (!student) {
    return {
      allowed: false,
      message: 'Aluno não encontrado.',
    };
  }

  if (blockDelinquent && student.status === StudentStatus.DELINQUENT) {
    return {
      allowed: false,
      message:
        'Aluno inadimplente não pode receber presença. Regularize a situação financeira no admin.',
    };
  }

  return { allowed: true };
}
