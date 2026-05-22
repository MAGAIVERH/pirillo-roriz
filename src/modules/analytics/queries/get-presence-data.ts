import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { safeDivision } from '../lib/analytics-helpers';
import type {
  AnalyticsPeriod,
  PresenceData,
  PresenceHeatmapCell,
} from '../types/analytics';

const ATTENDANCE_WINDOW_DAYS = 30;

export async function getPresenceData(
  period: AnalyticsPeriod,
): Promise<PresenceData> {
  const academy = await getOrCreateDefaultAcademy();

  const [presentAttendances, activeStudents, attendanceByStudent, topClassRows] =
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

  const cellMap = new Map<string, PresenceHeatmapCell>();
  const classAggregate = new Map<
    string,
    { name: string; total: number; sessionTimes: Date[] }
  >();

  for (const attendance of presentAttendances) {
    const session = attendance.classSession;
    const startsAt = session.startsAt;

    const weekDay = startsAt.getDay();
    const hour = startsAt.getHours();
    const key = `${weekDay}-${hour}`;

    const existing = cellMap.get(key);
    if (existing) {
      existing.checkIns += 1;
    } else {
      cellMap.set(key, { weekDay, hour, checkIns: 1 });
    }

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
    heatmap: Array.from(cellMap.values()),
    attendanceRate,
    studentsBelowHalfRate,
    topClass,
  };
}
