import { StudentStatus } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { changeStudentStatus } from './student-status-helpers';

export type SyncStudentDelinquencyResult = {
  success: boolean;
  message: string;
  promotedToDelinquent: number;
  restoredToActive: number;
};

export async function runStudentDelinquencySync(
  studentId?: string,
): Promise<SyncStudentDelinquencyResult> {
  try {
    const academy = await getOrCreateDefaultAcademy();
    const now = new Date();

    await db.invoice.updateMany({
      where: {
        academyId: academy.id,
        status: 'PENDING',
        dueDate: { lt: now },
        ...(studentId ? { studentId } : {}),
      },
      data: { status: 'OVERDUE' },
    });

    const students = await db.student.findMany({
      where: {
        academyId: academy.id,
        status: { in: [StudentStatus.ACTIVE, StudentStatus.DELINQUENT] },
        ...(studentId ? { id: studentId } : {}),
      },
      select: {
        id: true,
        status: true,
        invoices: {
          where: { status: 'OVERDUE' },
          select: { id: true },
          take: 1,
        },
      },
    });

    let promotedToDelinquent = 0;
    let restoredToActive = 0;

    for (const student of students) {
      const hasOverdue = student.invoices.length > 0;

      if (hasOverdue && student.status === StudentStatus.ACTIVE) {
        const result = await changeStudentStatus({
          studentId: student.id,
          fromStatus: student.status,
          toStatus: StudentStatus.DELINQUENT,
          notes: 'Atualização automática por fatura vencida.',
        });
        if (result.changed) promotedToDelinquent += 1;
      } else if (!hasOverdue && student.status === StudentStatus.DELINQUENT) {
        const result = await changeStudentStatus({
          studentId: student.id,
          fromStatus: student.status,
          toStatus: StudentStatus.ACTIVE,
          notes: 'Atualização automática após quitação financeira.',
        });
        if (result.changed) restoredToActive += 1;
      }
    }

    return {
      success: true,
      message: `${promotedToDelinquent} aluno(s) marcados como inadimplentes, ${restoredToActive} reativados.`,
      promotedToDelinquent,
      restoredToActive,
    };
  } catch (error) {
    console.error('runStudentDelinquencySync error', error);
    return {
      success: false,
      message: 'Não foi possível sincronizar a inadimplência.',
      promotedToDelinquent: 0,
      restoredToActive: 0,
    };
  }
}
