'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  AttendanceSource,
  AttendanceStatus,
  ClassSessionStatus,
} from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { requireInstructorContext } from '@/lib/session-context';
import { calculateStudentProgress } from '@/modules/students/lib/calcule-student-progress';
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
        endsAt: true,
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

    const isPresentStatus =
      parsed.data.status === AttendanceStatus.PRESENT ||
      parsed.data.status === AttendanceStatus.LATE;

    const existingAttendance = await db.attendance.findFirst({
      where: {
        classSessionId: session.id,
        studentId: parsed.data.studentId,
      },
      select: {
        id: true,
      },
    });

    const checkedInAt = isPresentStatus ? new Date() : null;

    if (existingAttendance) {
      await db.attendance.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          status: parsed.data.status,
          source: AttendanceSource.MANUAL,
          checkedInAt,
          recordedByUserId: user.id,
        },
      });
    } else {
      await db.attendance.create({
        data: {
          classSessionId: session.id,
          studentId: parsed.data.studentId,
          status: parsed.data.status,
          source: AttendanceSource.MANUAL,
          checkedInAt,
          recordedByUserId: user.id,
        },
      });
    }

    if (session.status === ClassSessionStatus.SCHEDULED) {
      await db.classSession.update({
        where: {
          id: session.id,
        },
        data: {
          status: ClassSessionStatus.OPEN,
        },
      });
    }

    await calculateStudentProgress(parsed.data.studentId);

    revalidatePath('/professor');
    revalidatePath('/professor/turmas');
    revalidatePath(`/professor/alunos/${parsed.data.studentId}`);
    revalidatePath(`/admin/alunos/${parsed.data.studentId}`);

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
