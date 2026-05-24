import { format } from 'date-fns';

export type JourneyHeatmapDay = {
  dateKey: string;
  dayLabel: string;
  status?: string;
  isInRange: boolean;
};

export type JourneyHeatmapWeek = JourneyHeatmapDay[];

export type JourneyAttendanceRecord = {
  date: string;
  status: string;
};

const toLocalDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

export function buildJourneyHeatmapWeeks(
  attendances: JourneyAttendanceRecord[],
  baseDateIso: string | null,
  today: Date = new Date(),
): JourneyHeatmapWeek[] {
  const attendanceMap = new Map(
    attendances.map((item) => [item.date, item.status]),
  );

  const minDate = baseDateIso
    ? new Date(`${baseDateIso}T00:00:00`)
    : undefined;

  const start = minDate ? new Date(minDate) : new Date(today);
  start.setHours(12, 0, 0, 0);

  if (!minDate) {
    start.setDate(start.getDate() - 119);
  }

  start.setDate(start.getDate() - start.getDay());

  const end = new Date(today);
  end.setHours(12, 0, 0, 0);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days: JourneyHeatmapDay[] = [];
  const rangeStartKey = minDate ? toLocalDateKey(minDate) : null;
  const rangeEndKey = toLocalDateKey(today);
  const cursor = new Date(start);

  while (cursor <= end) {
    const dateKey = toLocalDateKey(cursor);
    const status = attendanceMap.get(dateKey);
    const isInRange =
      dateKey >= (rangeStartKey ?? dateKey) && dateKey <= rangeEndKey;

    days.push({
      dateKey,
      dayLabel: format(cursor, 'dd/MM'),
      status,
      isInRange,
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  const weeks: JourneyHeatmapWeek[] = [];

  for (let index = 0; index < days.length; index += 7) {
    weeks.push(days.slice(index, index + 7));
  }

  return weeks;
}

export const journeyWeekDayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function getJourneyHeatmapStatusClassName(
  status?: string,
  isInRange?: boolean,
) {
  if (status === 'PRESENT') {
    return 'bg-emerald-500/80 border-emerald-400/30';
  }

  if (status === 'ABSENT') {
    return 'bg-red-500/80 border-red-400/30';
  }

  if (status === 'LATE') {
    return 'bg-amber-500/80 border-amber-400/30';
  }

  if (status === 'EXCUSED') {
    return 'bg-sky-500/80 border-sky-400/30';
  }

  if (isInRange) {
    return 'bg-zinc-700/70 border-zinc-500/25';
  }

  return 'bg-zinc-800/80 border-zinc-600/20';
}

export const journeyHeatmapStatusLabelMap: Record<string, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Falta',
  LATE: 'Atraso',
  EXCUSED: 'Justificado',
};
