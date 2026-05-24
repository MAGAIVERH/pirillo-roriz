import {
  AttendanceSource,
  AttendanceStatus,
  ClassSessionStatus,
} from '@/generated/prisma/client';
import { db } from '@/lib/db';
import { calculateStudentProgress } from '@/modules/students/lib/calcule-student-progress';

type RecordSessionAttendanceInput = {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  source: AttendanceSource;
  recordedByUserId?: string | null;
  checkedInAt?: Date | null;
  notes?: string | null;
  openSessionIfScheduled?: boolean;
};

export async function recordSessionAttendance(
  input: RecordSessionAttendanceInput,
): Promise<void> {
  const isPresentStatus =
    input.status === AttendanceStatus.PRESENT ||
    input.status === AttendanceStatus.LATE;

  const checkedInAt =
    input.checkedInAt === undefined
      ? isPresentStatus
        ? new Date()
        : null
      : input.checkedInAt;

  const existingAttendance = await db.attendance.findFirst({
    where: {
      classSessionId: input.sessionId,
      studentId: input.studentId,
    },
    select: {
      id: true,
    },
  });

  if (existingAttendance) {
    await db.attendance.update({
      where: {
        id: existingAttendance.id,
      },
      data: {
        status: input.status,
        source: input.source,
        checkedInAt,
        recordedByUserId: input.recordedByUserId ?? null,
        notes: input.notes?.trim() || null,
      },
    });
  } else {
    await db.attendance.create({
      data: {
        classSessionId: input.sessionId,
        studentId: input.studentId,
        status: input.status,
        source: input.source,
        checkedInAt,
        recordedByUserId: input.recordedByUserId ?? null,
        notes: input.notes?.trim() || null,
      },
    });
  }

  if (input.openSessionIfScheduled) {
    const session = await db.classSession.findFirst({
      where: {
        id: input.sessionId,
      },
      select: {
        status: true,
      },
    });

    if (session?.status === ClassSessionStatus.SCHEDULED) {
      await db.classSession.update({
        where: {
          id: input.sessionId,
        },
        data: {
          status: ClassSessionStatus.OPEN,
        },
      });
    }
  }

  await calculateStudentProgress(input.studentId);
}
