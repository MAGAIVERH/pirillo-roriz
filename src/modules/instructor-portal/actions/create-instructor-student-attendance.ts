'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  AttendanceSource,
  AttendanceStatus,
  ClassLevel,
  ClassSessionStatus,
} from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { requireInstructorContext } from '@/lib/session-context';
import { verifyInstructorStudentAccess } from '@/modules/instructor-portal/queries/verify-instructor-student-access';
import { calculateStudentProgress } from '@/modules/students/lib/calcule-student-progress';
import { validateStudentCanReceiveAttendance } from '@/modules/students/lib/validate-student-attendance';

const createInstructorStudentAttendanceSchema = z.object({
  studentId: z.string().min(1, 'Aluno inválido.'),
  attendanceDate: z.string().min(1, 'Selecione a data da presença.'),
  status: z.nativeEnum(AttendanceStatus, {
    error: 'Selecione um status válido.',
  }),
  notes: z.string().optional(),
});

type CreateInstructorStudentAttendanceInput = z.infer<
  typeof createInstructorStudentAttendanceSchema
>;

export const createInstructorStudentAttendanceAction = async (
  input: CreateInstructorStudentAttendanceInput,
): Promise<{ success: boolean; message: string }> => {
  const parsed = createInstructorStudentAttendanceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const { user, instructor } = await requireInstructorContext();
    const academy = await getOrCreateDefaultAcademy();

    const hasAccess = await verifyInstructorStudentAccess(
      instructor.id,
      parsed.data.studentId,
    );

    if (!hasAccess) {
      return {
        success: false,
        message: 'Você não tem permissão para lançar presença deste aluno.',
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

    const student = await db.student.findFirst({
      where: {
        id: parsed.data.studentId,
        academyId: academy.id,
      },
      select: {
        id: true,
      },
    });

    if (!student) {
      return {
        success: false,
        message: 'Aluno não encontrado.',
      };
    }

    const attendanceDate = new Date(
      `${parsed.data.attendanceDate}T12:00:00.000Z`,
    );

    let manualClassType = await db.classType.findFirst({
      where: {
        academyId: academy.id,
        name: 'Ajuste manual',
      },
      select: {
        id: true,
      },
    });

    if (!manualClassType) {
      manualClassType = await db.classType.create({
        data: {
          academyId: academy.id,
          name: 'Ajuste manual',
          level: ClassLevel.ALL_LEVELS,
        },
        select: {
          id: true,
        },
      });
    }

    let manualClass = await db.class.findFirst({
      where: {
        academyId: academy.id,
        name: 'Ajuste manual de presença',
      },
      select: {
        id: true,
      },
    });

    if (!manualClass) {
      manualClass = await db.class.create({
        data: {
          academyId: academy.id,
          classTypeId: manualClassType.id,
          name: 'Ajuste manual de presença',
          active: true,
        },
        select: {
          id: true,
        },
      });
    }

    let session = await db.classSession.findFirst({
      where: {
        classId: manualClass.id,
        sessionDate: attendanceDate,
      },
      select: {
        id: true,
      },
    });

    if (!session) {
      session = await db.classSession.create({
        data: {
          classId: manualClass.id,
          sessionDate: attendanceDate,
          startsAt: attendanceDate,
          endsAt: attendanceDate,
          instructorId: instructor.id,
          status: ClassSessionStatus.CLOSED,
          notes: 'Presença lançada pelo professor',
        },
        select: {
          id: true,
        },
      });
    }

    const existingAttendance = await db.attendance.findFirst({
      where: {
        classSessionId: session.id,
        studentId: student.id,
      },
      select: {
        id: true,
      },
    });

    const isPresentStatus =
      parsed.data.status === AttendanceStatus.PRESENT ||
      parsed.data.status === AttendanceStatus.LATE;

    if (existingAttendance) {
      await db.attendance.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          status: parsed.data.status,
          source: AttendanceSource.MANUAL,
          checkedInAt: isPresentStatus ? attendanceDate : null,
          recordedByUserId: user.id,
          notes: parsed.data.notes?.trim() || null,
        },
      });
    } else {
      await db.attendance.create({
        data: {
          classSessionId: session.id,
          studentId: student.id,
          status: parsed.data.status,
          source: AttendanceSource.MANUAL,
          checkedInAt: isPresentStatus ? attendanceDate : null,
          recordedByUserId: user.id,
          notes: parsed.data.notes?.trim() || null,
        },
      });
    }

    await calculateStudentProgress(student.id);

    revalidatePath(`/professor/alunos/${student.id}`);
    revalidatePath('/professor/turmas');
    revalidatePath('/professor');
    revalidatePath(`/admin/alunos/${student.id}`);

    return {
      success: true,
      message: existingAttendance
        ? 'Presença atualizada com sucesso.'
        : 'Presença lançada com sucesso.',
    };
  } catch (error) {
    console.error('createInstructorStudentAttendanceAction error', error);

    return {
      success: false,
      message: 'Não foi possível salvar a presença.',
    };
  }
};
