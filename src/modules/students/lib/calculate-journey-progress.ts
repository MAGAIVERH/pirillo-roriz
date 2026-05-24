export type JourneyProgressMetrics = {
  progressPercent: number;
  timePercent: number;
  attendancePercent: number;
  elapsedProgressDays: number;
  totalProgressDays: number;
  remainingDays: number;
};

type CalculateJourneyProgressInput = {
  baseDate: Date;
  projectedDate: Date;
  today?: Date;
  attendancesSincePromotion: number;
  minimumAttendances: number;
};

const dayMs = 1000 * 60 * 60 * 24;

export function calculateJourneyProgressMetrics({
  baseDate,
  projectedDate,
  today = new Date(),
  attendancesSincePromotion,
  minimumAttendances,
}: CalculateJourneyProgressInput): JourneyProgressMetrics {
  const totalProgressDays = Math.max(
    1,
    Math.ceil((projectedDate.getTime() - baseDate.getTime()) / dayMs),
  );

  const elapsedProgressDays = Math.min(
    totalProgressDays,
    Math.max(0, Math.ceil((today.getTime() - baseDate.getTime()) / dayMs)),
  );

  const remainingDays = Math.max(
    0,
    Math.ceil((projectedDate.getTime() - today.getTime()) / dayMs),
  );

  const timePercent = Math.min(
    100,
    Math.round((elapsedProgressDays / totalProgressDays) * 100),
  );

  const attendancePercent =
    minimumAttendances > 0
      ? Math.min(
          100,
          Math.round(
            (attendancesSincePromotion / minimumAttendances) * 100,
          ),
        )
      : 100;

  const progressPercent =
    minimumAttendances > 0
      ? Math.min(timePercent, attendancePercent)
      : timePercent;

  return {
    progressPercent,
    timePercent,
    attendancePercent,
    elapsedProgressDays,
    totalProgressDays,
    remainingDays,
  };
}

export function formatMinimumMonthsLabel(minimumMonths: number): string {
  if (minimumMonths % 12 === 0 && minimumMonths >= 12) {
    const years = minimumMonths / 12;
    return years === 1 ? '12 meses (1 ano)' : `${minimumMonths} meses (${years} anos)`;
  }

  if (minimumMonths === 18) {
    return '18 meses (1,5 anos)';
  }

  return `${minimumMonths} meses`;
}
