import {
  addDays,
  endOfDay,
  format,
  isAfter,
  isWithinInterval,
  startOfDay,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { safeDivision } from '../lib/analytics-helpers';
import type {
  AnalyticsPeriod,
  PresenceCalendarDay,
  PresenceCalendarWeek,
  PresenceData,
} from '../types/analytics';

const ATTENDANCE_WINDOW_DAYS = 30;
const HEATMAP_WEEKS = 16;

function getWeekLabel(weekStart: Date): string {
  for (let offset = 0; offset < 7; offset += 1) {
    const day = addDays(weekStart, offset);

    if (day.getDate() === 1) {
      return format(day, 'MMM', { locale: ptBR });
    }
  }

  return format(weekStart, 'd', { locale: ptBR });
}

function buildRollingCalendarWeeks(
  windowStart: Date,
  windowEnd: Date,
  periodStart: Date,
  periodEnd: Date,
  checkInsByDate: Map<string, number>,
  today: Date,
  isLiveWindow: boolean,
): PresenceCalendarWeek[] {
  const weeks: PresenceCalendarWeek[] = [];
  let weekStart = startOfWeek(windowStart, { weekStartsOn: 0 });
  let weekIndex = 0;

  while (weekStart <= windowEnd) {
    const days: PresenceCalendarDay[] = [];

    for (let offset = 0; offset < 7; offset += 1) {
      const day = addDays(weekStart, offset);
      const dateKey = format(day, 'yyyy-MM-dd');
      const isInWindow = day >= windowStart && day <= windowEnd;
      const inMonth = isWithinInterval(day, {
        start: periodStart,
        end: periodEnd,
      });
      const isFuture = isLiveWindow && isAfter(day, today);
      const isToday = dateKey === format(today, 'yyyy-MM-dd');

      days.push({
        dateKey,
        dayOfMonth: day.getDate(),
        weekDay: day.getDay(),
        checkIns:
          isInWindow && !isFuture ? (checkInsByDate.get(dateKey) ?? 0) : 0,
        inMonth,
        isInWindow,
        isFuture: isInWindow && isFuture,
        isToday,
      });
    }

    weeks.push({
      weekIndex,
      label: getWeekLabel(weekStart),
      days,
    });

    weekStart = addDays(weekStart, 7);
    weekIndex += 1;
  }

  return weeks;
}

export async function getPresenceData(
  period: AnalyticsPeriod,
): Promise<PresenceData> {
  const academy = await getOrCreateDefaultAcademy();
  const referenceNow = new Date();
  const today = startOfDay(referenceNow);
  const isCurrentMonth =
    period.current.year === referenceNow.getFullYear() &&
    period.current.month === referenceNow.getMonth() + 1;

  const windowEnd = startOfDay(
    isCurrentMonth && today <= period.current.end ? today : period.current.end,
  );
  const windowStart = startOfWeek(
    subWeeks(windowEnd, HEATMAP_WEEKS - 1),
    { weekStartsOn: 0 },
  );

  const [presentAttendances, heatmapAttendances, activeStudents, attendanceByStudent, topClassRows] =
    await Promise.all([
      db.attendance.findMany({
        where: {
          status: 'PRESENT',
          createdAt: { gte: period.current.start, lte: period.current.end },
          classSession: { class: { academyId: academy.id } },
        },
        select: {
          classSession: {
            select: {
              startsAt: true,
              classId: true,
              class: { select: { name: true } },
            },
          },
        },
      }),
      db.attendance.findMany({
        where: {
          status: 'PRESENT',
          createdAt: {
            gte: windowStart,
            lte: endOfDay(windowEnd),
          },
          classSession: { class: { academyId: academy.id } },
        },
        select: {
          classSession: {
            select: {
              startsAt: true,
            },
          },
        },
      }),
      db.student.count({
        where: { academyId: academy.id, status: 'ACTIVE' },
      }),
      db.attendance.groupBy({
        by: ['studentId'],
        where: {
          status: 'PRESENT',
          createdAt: {
            gte: new Date(
              period.current.end.getTime() -
                ATTENDANCE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
            ),
            lte: period.current.end,
          },
          classSession: { class: { academyId: academy.id } },
        },
        _count: { _all: true },
      }),
      db.attendance.groupBy({
        by: ['classSessionId'],
        where: {
          status: 'PRESENT',
          createdAt: { gte: period.current.start, lte: period.current.end },
          classSession: { class: { academyId: academy.id } },
        },
        _count: { _all: true },
      }),
    ]);

  const checkInsByDate = new Map<string, number>();
  const classAggregate = new Map<
    string,
    { name: string; total: number; sessionTimes: Date[] }
  >();

  for (const attendance of presentAttendances) {
    const session = attendance.classSession;
    const startsAt = session.startsAt;

    const classBucket = classAggregate.get(session.classId);
    if (classBucket) {
      classBucket.total += 1;
      classBucket.sessionTimes.push(startsAt);
    } else {
      classAggregate.set(session.classId, {
        name: session.class.name,
        total: 1,
        sessionTimes: [startsAt],
      });
    }
  }

  for (const attendance of heatmapAttendances) {
    const dateKey = format(attendance.classSession.startsAt, 'yyyy-MM-dd');
    checkInsByDate.set(dateKey, (checkInsByDate.get(dateKey) ?? 0) + 1);
  }

  const calendarWeeks = buildRollingCalendarWeeks(
    windowStart,
    windowEnd,
    period.current.start,
    period.current.end,
    checkInsByDate,
    today,
    isCurrentMonth,
  );

  const totalPresences = presentAttendances.length;
  const sessionsInMonth = topClassRows.length || 1;
  const expectedPresences = activeStudents * sessionsInMonth * 0.5;
  const attendanceRate = expectedPresences
    ? Math.min(safeDivision(totalPresences, expectedPresences) * 100, 100)
    : 0;

  const studentsBelowHalfRate = attendanceByStudent.filter(
    (entry) => entry._count._all < 6,
  ).length;

  let topClass: PresenceData['topClass'] = null;
  let topTotal = 0;
  for (const [, bucket] of classAggregate) {
    if (bucket.total > topTotal) {
      topTotal = bucket.total;
      const sample = bucket.sessionTimes[0];
      const scheduleLabel = sample
        ? `${String(sample.getHours()).padStart(2, '0')}h${String(
            sample.getMinutes(),
          ).padStart(2, '0')}`
        : null;
      topClass = { name: bucket.name, schedule: scheduleLabel };
    }
  }

  return {
    calendarWeeks,
    monthLabel: period.current.label,
    isCurrentMonth,
    attendanceRate,
    studentsBelowHalfRate,
    topClass,
  };
}
