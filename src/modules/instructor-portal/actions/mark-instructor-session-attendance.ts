'use server';

import { z } from 'zod';

import {
  AttendanceSource,
  AttendanceStatus,
  ClassSessionStatus,
} from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { requireInstructorContext } from '@/lib/session-context';
import { recordSessionAttendance } from '@/modules/attendance/lib/record-session-attendance';
import { revalidateAttendancePaths } from '@/modules/attendance/lib/revalidate-attendance-paths';
import { validateStudentCanReceiveAttendance } from '@/modules/students/lib/validate-student-attendance';

const markInstructorSessionAttendanceSchema = z.object({
  sessionId: z.string().min(1, 'Sessão inválida.'),
  studentId: z.string().min(1, 'Aluno inválido.'),
  status: z.nativeEnum(AttendanceStatus, {
    error: 'Selecione um status válido.',
  }),
});

type MarkInstructorSessionAttendanceInput = z.infer<
  typeof markInstructorSessionAttendanceSchema
>;

export const markInstructorSessionAttendanceAction = async (
  input: MarkInstructorSessionAttendanceInput,
): Promise<{ success: boolean; message: string }> => {
  const parsed = markInstructorSessionAttendanceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const { user, instructor } = await requireInstructorContext();
    const academy = await getOrCreateDefaultAcademy();

    const session = await db.classSession.findFirst({
      where: {
        id: parsed.data.sessionId,
        instructorId: instructor.id,
        class: {
          academyId: academy.id,
        },
      },
      select: {
        id: true,
        status: true,
        classId: true,
      },
    });

    if (!session) {
      return {
        success: false,
        message: 'Sessão não encontrada ou sem permissão.',
      };
    }

    if (session.status === ClassSessionStatus.CLOSED) {
      return {
        success: false,
        message: 'Esta aula já foi encerrada e não aceita alterações.',
      };
    }

    const enrollment = await db.enrollment.findFirst({
      where: {
        classId: session.classId,
        studentId: parsed.data.studentId,
        status: 'ACTIVE',
      },
      select: {
        id: true,
      },
    });

    if (!enrollment) {
      return {
        success: false,
        message: 'Aluno não está matriculado nesta turma.',
      };
    }

    const validation = await validateStudentCanReceiveAttendance(
      parsed.data.studentId,
      { blockDelinquent: true },
    );

    if (!validation.allowed) {
      return {
        success: false,
        message: validation.message,
      };
    }

    await recordSessionAttendance({
      sessionId: session.id,
      studentId: parsed.data.studentId,
      status: parsed.data.status,
      source: AttendanceSource.MANUAL,
      recordedByUserId: user.id,
      openSessionIfScheduled: true,
    });

    revalidateAttendancePaths(parsed.data.studentId);

    return {
      success: true,
      message: 'Presença registrada com sucesso.',
    };
  } catch (error) {
    console.error('markInstructorSessionAttendanceAction error', error);

    return {
      success: false,
      message: 'Não foi possível registrar a presença.',
    };
  }
};
