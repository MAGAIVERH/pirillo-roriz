import {
  AttendanceSource,
  AttendanceStatus,
  ClassSessionStatus,
  type WeekDay,
} from '@/generated/prisma/client';
import { db } from '@/lib/db';
import { calculateStudentProgress } from '@/modules/students/lib/calcule-student-progress';

export const jsDayToWeekDay = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const satisfies readonly WeekDay[];

export type SessionPhase = 'upcoming' | 'ongoing' | 'finished';

export function getTodayDateOnly(reference = new Date()): Date {
  return new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
    0,
    0,
    0,
    0,
  );
}

export function buildSessionDateTime(baseDate: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);

  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes,
    0,
    0,
  );
}

export function getSessionPhase(
  startsAt: Date,
  endsAt: Date,
  reference = new Date(),
): SessionPhase {
  if (reference < startsAt) {
    return 'upcoming';
  }

  if (reference <= endsAt) {
    return 'ongoing';
  }

  return 'finished';
}

type EnsureClassSessionInput = {
  classId: string;
  classScheduleId: string;
  instructorId: string;
  sessionDate: Date;
  startsAt: Date;
  endsAt: Date;
};

export async function ensureClassSession(
  input: EnsureClassSessionInput,
): Promise<{ id: string }> {
  const existingSession = await db.classSession.findFirst({
    where: {
      classId: input.classId,
      classScheduleId: input.classScheduleId,
      sessionDate: input.sessionDate,
    },
    select: {
      id: true,
    },
  });

  if (existingSession) {
    return existingSession;
  }

  return db.classSession.create({
    data: {
      classId: input.classId,
      classScheduleId: input.classScheduleId,
      instructorId: input.instructorId,
      sessionDate: input.sessionDate,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      status: ClassSessionStatus.SCHEDULED,
    },
    select: {
      id: true,
    },
  });
}

type ProcessSessionAbsencesInput = {
  sessionId: string;
  studentIds: string[];
  endsAt: Date;
  reference?: Date;
};

export async function processSessionAbsences(
  input: ProcessSessionAbsencesInput,
): Promise<void> {
  const reference = input.reference ?? new Date();

  if (reference <= input.endsAt) {
    return;
  }

  const existingAttendances = await db.attendance.findMany({
    where: {
      classSessionId: input.sessionId,
    },
    select: {
      studentId: true,
    },
  });

  const recordedStudentIds = new Set(
    existingAttendances.map((item) => item.studentId),
  );

  const missingStudentIds = input.studentIds.filter(
    (studentId) => !recordedStudentIds.has(studentId),
  );

  if (missingStudentIds.length > 0) {
    await db.attendance.createMany({
      data: missingStudentIds.map((studentId) => ({
        classSessionId: input.sessionId,
        studentId,
        status: AttendanceStatus.ABSENT,
        source: AttendanceSource.MANUAL,
      })),
      skipDuplicates: true,
    });

    await Promise.all(
      missingStudentIds.map((studentId) => calculateStudentProgress(studentId)),
    );
  }

  await db.classSession.update({
    where: {
      id: input.sessionId,
    },
    data: {
      status: ClassSessionStatus.CLOSED,
    },
  });
}
