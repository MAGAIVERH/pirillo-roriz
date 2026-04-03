'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import {
  AttendanceSource,
  AttendanceStatus,
  ClassSessionStatus,
  ClassLevel,
} from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const createStudentManualAttendanceSchema = z.object({
  studentId: z.string().min(1, 'Aluno inválido.'),
  attendanceDate: z.string().min(1, 'Selecione a data da presença.'),
  status: z.nativeEnum(AttendanceStatus, {
    error: 'Selecione um status válido.',
  }),
  notes: z.string().optional(),
});

type CreateStudentManualAttendanceInput = z.infer<
  typeof createStudentManualAttendanceSchema
>;

export const createStudentManualAttendanceAction = async (
  input: CreateStudentManualAttendanceInput,
) => {
  const parsed = createStudentManualAttendanceSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const student = await db.student.findFirst({
      where: {
        id: parsed.data.studentId,
        academyId: academy.id,
      },
      select: {
        id: true,
        fullName: true,
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
          status: ClassSessionStatus.CLOSED,
          notes: `Presença histórica lançada manualmente`,
        },
        select: {
          id: true,
        },
      });
    }

    const duplicatedAttendance = await db.attendance.findFirst({
      where: {
        classSessionId: session.id,
        studentId: student.id,
      },
      select: {
        id: true,
      },
    });

    if (duplicatedAttendance) {
      return {
        success: false,
        message: 'Já existe um lançamento para esse aluno nessa data.',
      };
    }

    await db.attendance.create({
      data: {
        classSessionId: session.id,
        studentId: student.id,
        status: parsed.data.status,
        source: AttendanceSource.ADMIN_ADJUSTMENT,
        checkedInAt:
          parsed.data.status === AttendanceStatus.PRESENT ||
          parsed.data.status === AttendanceStatus.LATE
            ? attendanceDate
            : null,
        notes: parsed.data.notes?.trim() || null,
      },
    });

    revalidatePath(`/admin/alunos/${student.id}`);

    return {
      success: true,
      message: 'Presença lançada com sucesso.',
    };
  } catch (error) {
    console.error('createStudentManualAttendanceAction error', error);

    return {
      success: false,
      message: 'Não foi possível lançar a presença.',
    };
  }
};
