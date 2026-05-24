import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import {
  calculateJourneyProgressMetrics,
  formatMinimumMonthsLabel,
} from '@/modules/students/lib/calculate-journey-progress';
import { buildJourneyHeatmapWeeks } from '@/modules/students/lib/build-journey-heatmap';
import { calculateStudentProgress } from '@/modules/students/lib/calcule-student-progress';

import type { JourneyHeatmapWeek } from '@/modules/students/lib/build-journey-heatmap';

export type StudentPresencePageData = {
  heatmapWeeks: JourneyHeatmapWeek[];
  progress: {
    currentBeltName: string;
    attendancesSincePromotion: number;
    absencesSincePromotion: number;
    minimumAttendances: number;
    minimumMonthsLabel: string;
    progressPercent: number;
    timePercent: number;
    attendancePercent: number;
    elapsedProgressDays: number;
    totalProgressDays: number;
    remainingDays: number;
    baseDateLabel: string;
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

  const [attendanceHistory, recentAttendances, progressResult] =
    await Promise.all([
      db.attendance.findMany({
        where: {
          studentId,
          student: {
            academyId: academy.id,
          },
        },
        select: {
          status: true,
          classSession: {
            select: {
              sessionDate: true,
            },
          },
        },
        orderBy: {
          classSession: {
            sessionDate: 'asc',
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

  const journeyAttendances = attendanceHistory.map((item) => ({
    date: item.classSession.sessionDate.toISOString().split('T')[0],
    status: item.status,
  }));

  const baseDateIso =
    progressResult.success && progressResult.baseDate
      ? progressResult.baseDate.toISOString().split('T')[0]
      : null;

  const heatmapWeeks = buildJourneyHeatmapWeeks(
    journeyAttendances,
    baseDateIso,
  );

  const progress =
    progressResult.success && progressResult.progress && progressResult.rule
      ? (() => {
          const projectedDate =
            progressResult.progress.projectedEligibilityDate ??
            progressResult.baseDate;
          const metrics = calculateJourneyProgressMetrics({
            baseDate: progressResult.baseDate,
            projectedDate,
            attendancesSincePromotion:
              progressResult.progress.attendancesSincePromotion,
            minimumAttendances: progressResult.rule.minimumAttendances,
          });

          const minimumAttendances = progressResult.rule.minimumAttendances;
          const minimumMonthsLabel = formatMinimumMonthsLabel(
            progressResult.rule.minimumMonths,
          );

          return {
            currentBeltName: progressResult.currentBeltName,
            attendancesSincePromotion:
              progressResult.progress.attendancesSincePromotion,
            absencesSincePromotion:
              progressResult.progress.absencesSincePromotion,
            minimumAttendances,
            minimumMonthsLabel,
            progressPercent: metrics.progressPercent,
            timePercent: metrics.timePercent,
            attendancePercent: metrics.attendancePercent,
            elapsedProgressDays: metrics.elapsedProgressDays,
            totalProgressDays: metrics.totalProgressDays,
            remainingDays: metrics.remainingDays,
            baseDateLabel: progressResult.baseDate.toLocaleDateString('pt-BR'),
            status:
              statusLabelMap[progressResult.progress.status] ?? 'No ritmo',
            projectedEligibilityDateLabel:
              progressResult.progress.projectedEligibilityDate?.toLocaleDateString(
                'pt-BR',
              ) ?? '—',
          };
        })()
      : null;

  return {
    heatmapWeeks,
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
