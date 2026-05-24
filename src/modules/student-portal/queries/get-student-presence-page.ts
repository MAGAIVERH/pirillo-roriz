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
import { calculateStudentProgress } from '@/modules/students/lib/calcule-student-progress';

import type {
  PresenceCalendarDay,
  PresenceCalendarWeek,
  PresenceData,
} from '@/modules/analytics/types/analytics';

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
      const isFuture = isAfter(day, today);
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

export type StudentPresencePageData = {
  presence: PresenceData;
  progress: {
    currentBeltName: string;
    attendancesSincePromotion: number;
    absencesSincePromotion: number;
    minimumAttendances: number;
    minimumMonths: number;
    progressPercent: number;
    status: string;
    projectedEligibilityDateLabel: string;
  } | null;
  recentAttendances: Array<{
    id: string;
    dateLabel: string;
    status: string;
    source: string;
    className: string;
  }>;
};

const statusLabelMap: Record<string, string> = {
  ON_TRACK: 'No ritmo',
  ELIGIBLE: 'Apto a graduar',
  POSTPONED: 'Aguardando presenças',
};

const sourceLabelMap: Record<string, string> = {
  MANUAL: 'Manual',
  QR_CODE: 'QR Code',
  ADMIN_ADJUSTMENT: 'Admin',
};

export async function getStudentPresencePage(
  studentId: string,
): Promise<StudentPresencePageData> {
  const academy = await getOrCreateDefaultAcademy();
  const referenceNow = new Date();
  const today = startOfDay(referenceNow);
  const periodStart = startOfDay(
    new Date(referenceNow.getFullYear(), referenceNow.getMonth(), 1),
  );
  const periodEnd = endOfDay(
    new Date(referenceNow.getFullYear(), referenceNow.getMonth() + 1, 0),
  );

  const windowEnd = today;
  const windowStart = startOfWeek(
    subWeeks(windowEnd, HEATMAP_WEEKS - 1),
    { weekStartsOn: 0 },
  );

  const [heatmapAttendances, recentAttendances, progressResult] =
    await Promise.all([
      db.attendance.findMany({
        where: {
          studentId,
          status: { in: ['PRESENT', 'LATE'] },
          classSession: {
            sessionDate: {
              gte: windowStart,
              lte: endOfDay(windowEnd),
            },
          },
        },
        select: {
          classSession: {
            select: {
              sessionDate: true,
            },
          },
        },
      }),
      db.attendance.findMany({
        where: {
          studentId,
          student: {
            academyId: academy.id,
          },
        },
        orderBy: {
          classSession: {
            sessionDate: 'desc',
          },
        },
        take: 12,
        select: {
          id: true,
          status: true,
          source: true,
          classSession: {
            select: {
              sessionDate: true,
              class: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      calculateStudentProgress(studentId),
    ]);

  const checkInsByDate = new Map<string, number>();

  for (const attendance of heatmapAttendances) {
    const dateKey = format(attendance.classSession.sessionDate, 'yyyy-MM-dd');
    checkInsByDate.set(dateKey, (checkInsByDate.get(dateKey) ?? 0) + 1);
  }

  const monthLabel = format(referenceNow, 'MMMM yyyy', { locale: ptBR });
  const calendarWeeks = buildRollingCalendarWeeks(
    windowStart,
    windowEnd,
    periodStart,
    periodEnd,
    checkInsByDate,
    today,
  );

  const monthCheckIns = heatmapAttendances.filter((item) => {
    const date = item.classSession.sessionDate;
    return date >= periodStart && date <= periodEnd;
  }).length;

  const presence: PresenceData = {
    monthLabel,
    isCurrentMonth: true,
    calendarWeeks,
    attendanceRate: monthCheckIns > 0 ? 100 : 0,
    studentsBelowHalfRate: 0,
    topClass: null,
  };

  const progress =
    progressResult.success && progressResult.progress && progressResult.rule
      ? {
          currentBeltName: progressResult.currentBeltName,
          attendancesSincePromotion:
            progressResult.progress.attendancesSincePromotion,
          absencesSincePromotion:
            progressResult.progress.absencesSincePromotion,
          minimumAttendances: progressResult.rule.minimumAttendances,
          minimumMonths: progressResult.rule.minimumMonths,
          progressPercent: Math.min(
            100,
            Math.round(
              (progressResult.progress.attendancesSincePromotion /
                Math.max(progressResult.rule.minimumAttendances, 1)) *
                100,
            ),
          ),
          status: statusLabelMap[progressResult.progress.status] ?? 'No ritmo',
          projectedEligibilityDateLabel:
            progressResult.progress.projectedEligibilityDate?.toLocaleDateString(
              'pt-BR',
            ) ?? '—',
        }
      : null;

  return {
    presence,
    progress,
    recentAttendances: recentAttendances.map((item) => ({
      id: item.id,
      dateLabel: item.classSession.sessionDate.toLocaleDateString('pt-BR'),
      status: item.status,
      source: sourceLabelMap[item.source] ?? item.source,
      className: item.classSession.class.name,
    })),
  };
}
