import { StudentStatus, type WeekDay } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import {
  buildSessionDateTime,
  ensureClassSession,
  getSessionPhase,
  getTodayDateOnly,
  jsDayToWeekDay,
  processSessionAbsences,
  type SessionPhase,
} from '@/modules/instructor-portal/lib/class-session-helpers';
import type { InstructorAttendanceStatus } from '@/modules/instructor-portal/types/attendance-status';

export type InstructorTodayAttendanceStudent = {
  id: string;
  fullName: string;
  belt: string;
  status: StudentStatus;
  attendanceStatus: InstructorAttendanceStatus | null;
  canReceiveAttendance: boolean;
};

export type InstructorTodayAttendanceSlot = {
  sessionId: string;
  classId: string;
  className: string;
  classType: string;
  scheduleId: string;
  startTime: string;
  endTime: string;
  startsAtIso: string;
  endsAtIso: string;
  phase: SessionPhase;
  students: InstructorTodayAttendanceStudent[];
};

export type InstructorTodayAttendanceOverview = {
  activeSlots: InstructorTodayAttendanceSlot[];
  finishedSlots: InstructorTodayAttendanceSlot[];
  hasAnyScheduleToday: boolean;
};

function sortSlotsByStartTime(
  slots: InstructorTodayAttendanceSlot[],
): InstructorTodayAttendanceSlot[] {
  return [...slots].sort((a, b) =>
    a.startsAtIso.localeCompare(b.startsAtIso),
  );
}

function pickActiveSlots(
  slots: InstructorTodayAttendanceSlot[],
): InstructorTodayAttendanceSlot[] {
  const ongoing = slots.filter((slot) => slot.phase === 'ongoing');
  if (ongoing.length > 0) {
    return sortSlotsByStartTime(ongoing);
  }

  const upcoming = slots.filter((slot) => slot.phase === 'upcoming');
  if (upcoming.length > 0) {
    return sortSlotsByStartTime(upcoming).slice(0, 1);
  }

  return [];
}

export async function getInstructorTodayAttendance(
  instructorId: string,
): Promise<InstructorTodayAttendanceOverview> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();
  const todayDate = getTodayDateOnly(now);
  const todayWeekDay = jsDayToWeekDay[now.getDay()] as WeekDay;

  const classes = await db.class.findMany({
    where: {
      academyId: academy.id,
      instructorId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      classType: {
        select: {
          name: true,
        },
      },
      schedules: {
        where: {
          weekDay: todayWeekDay,
        },
        orderBy: {
          startTime: 'asc',
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
        },
      },
      enrollments: {
        where: {
          status: 'ACTIVE',
        },
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true,
              beltStatus: {
                select: {
                  currentBelt: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  const slots: InstructorTodayAttendanceSlot[] = [];

  for (const classItem of classes) {
    for (const schedule of classItem.schedules) {
      const startsAt = buildSessionDateTime(todayDate, schedule.startTime);
      const endsAt = buildSessionDateTime(todayDate, schedule.endTime);
      const phase = getSessionPhase(startsAt, endsAt, now);

      const session = await ensureClassSession({
        classId: classItem.id,
        classScheduleId: schedule.id,
        instructorId,
        sessionDate: todayDate,
        startsAt,
        endsAt,
      });

      const studentIds = classItem.enrollments.map(
        (enrollment) => enrollment.student.id,
      );

      if (phase === 'finished') {
        await processSessionAbsences({
          sessionId: session.id,
          studentIds,
          endsAt,
          reference: now,
        });
      }

      const attendances = await db.attendance.findMany({
        where: {
          classSessionId: session.id,
        },
        select: {
          studentId: true,
          status: true,
        },
      });

      const attendanceByStudentId = new Map(
        attendances.map((item) => [item.studentId, item.status]),
      );

      slots.push({
        sessionId: session.id,
        classId: classItem.id,
        className: classItem.name,
        classType: classItem.classType.name,
        scheduleId: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        startsAtIso: startsAt.toISOString(),
        endsAtIso: endsAt.toISOString(),
        phase,
        students: classItem.enrollments
          .map((enrollment) => ({
            id: enrollment.student.id,
            fullName: enrollment.student.fullName,
            belt:
              enrollment.student.beltStatus?.currentBelt?.name ?? 'Sem faixa',
            status: enrollment.student.status,
            attendanceStatus:
              attendanceByStudentId.get(enrollment.student.id) ?? null,
            canReceiveAttendance:
              enrollment.student.status !== StudentStatus.DELINQUENT,
          }))
          .sort((a, b) => a.fullName.localeCompare(b.fullName, 'pt-BR')),
      });
    }
  }

  const sortedSlots = sortSlotsByStartTime(slots);

  return {
    activeSlots: pickActiveSlots(sortedSlots),
    finishedSlots: sortedSlots.filter((slot) => slot.phase === 'finished'),
    hasAnyScheduleToday: sortedSlots.length > 0,
  };
}
