import type { Prisma, StudentStatus } from '@/generated/prisma/client';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

type DbClient =
  | typeof db
  | Prisma.TransactionClient;

type ChangeStudentStatusInput = {
  studentId: string;
  toStatus: StudentStatus;
  changedByUserId?: string | null;
  reasonId?: string | null;
  notes?: string | null;
  /**
   * Quando informado, evita uma leitura extra do status atual.
   * Útil em contextos onde o caller já conhece o status anterior.
   */
  fromStatus?: StudentStatus;
};

type ChangeStudentStatusResult = {
  changed: boolean;
  fromStatus: StudentStatus;
  toStatus: StudentStatus;
};

/**
 * Muda o status de um aluno em transação implícita:
 * 1. Lê status atual (se não vier no input)
 * 2. Se for igual, faz nada (evita ruído no histórico)
 * 3. Cria StudentStatusHistory + atualiza Student.status
 *
 * Aceita um `client` opcional para uso dentro de transações externas.
 */
export async function changeStudentStatus(
  input: ChangeStudentStatusInput,
  client: DbClient = db,
): Promise<ChangeStudentStatusResult> {
  let fromStatus = input.fromStatus;

  if (!fromStatus) {
    const academy = await getOrCreateDefaultAcademy();

    const student = await client.student.findFirst({
      where: {
        id: input.studentId,
        academyId: academy.id,
      },
      select: { status: true },
    });

    if (!student) {
      throw new Error(`Aluno ${input.studentId} não encontrado.`);
    }

    fromStatus = student.status;
  }

  if (fromStatus === input.toStatus) {
    return { changed: false, fromStatus, toStatus: input.toStatus };
  }

  await client.studentStatusHistory.create({
    data: {
      studentId: input.studentId,
      fromStatus,
      toStatus: input.toStatus,
      changedByUserId: input.changedByUserId ?? null,
      reasonId: input.reasonId ?? null,
      notes: input.notes?.trim() || null,
    },
  });

  await client.student.update({
    where: { id: input.studentId },
    data: { status: input.toStatus },
  });

  return { changed: true, fromStatus, toStatus: input.toStatus };
}
