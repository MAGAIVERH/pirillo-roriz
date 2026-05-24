import { type WeekDay } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { isWithinCheckInWindow } from '@/modules/attendance/lib/check-in-window';
import {
  buildSessionDateTime,
  ensureClassSession,
  getSessionPhase,
  getTodayDateOnly,
  jsDayToWeekDay,
} from '@/modules/instructor-portal/lib/class-session-helpers';

export type InstructorQrCheckInSession = {
  sessionId: string;
  classId: string;
  className: string;
  classType: string;
  startTime: string;
  endTime: string;
  phase: 'upcoming' | 'ongoing' | 'finished';
  isCheckInOpen: boolean;
};

export async function getInstructorQrCheckInSessions(
  instructorId: string,
): Promise<InstructorQrCheckInSession[]> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();
  const todayDate = getTodayDateOnly(now);
  const todayWeekDay = jsDayToWeekDay[now.getDay()] as WeekDay;

  const [classes, settings] = await Promise.all([
    db.class.findMany({
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
      },
    }),
    db.academySettings.findFirst({
      where: {
        academyId: academy.id,
      },
      select: {
        allowQrCheckIn: true,
        checkInWindowMinutesBeforeClass: true,
        checkInWindowMinutesAfterClass: true,
      },
    }),
  ]);

  const checkInSettings = {
    allowQrCheckIn: settings?.allowQrCheckIn ?? true,
    checkInWindowMinutesBeforeClass:
      settings?.checkInWindowMinutesBeforeClass ?? 30,
    checkInWindowMinutesAfterClass:
      settings?.checkInWindowMinutesAfterClass ?? 30,
  };

  const sessions: InstructorQrCheckInSession[] = [];

  for (const classItem of classes) {
    for (const schedule of classItem.schedules) {
      const startsAt = buildSessionDateTime(todayDate, schedule.startTime);
      const endsAt = buildSessionDateTime(todayDate, schedule.endTime);
      const ensuredSession = await ensureClassSession({
        classId: classItem.id,
        classScheduleId: schedule.id,
        instructorId,
        sessionDate: todayDate,
        startsAt,
        endsAt,
      });

      const phase = getSessionPhase(startsAt, endsAt, now);
      const isCheckInOpen =
        checkInSettings.allowQrCheckIn &&
        phase !== 'finished' &&
        isWithinCheckInWindow(
          {
            startsAt,
            endsAt,
          },
          checkInSettings,
          now,
        );

      sessions.push({
        sessionId: ensuredSession.id,
        classId: classItem.id,
        className: classItem.name,
        classType: classItem.classType.name,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        phase,
        isCheckInOpen,
      });
    }
  }

  return sessions.sort((left, right) =>
    left.startTime.localeCompare(right.startTime),
  );
}
