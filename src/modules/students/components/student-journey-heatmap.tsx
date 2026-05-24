'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  getJourneyHeatmapStatusClassName,
  journeyHeatmapStatusLabelMap,
  journeyWeekDayLabels,
  type JourneyHeatmapWeek,
} from '@/modules/students/lib/build-journey-heatmap';

type StudentJourneyHeatmapProps = {
  weeks: JourneyHeatmapWeek[];
};

export function StudentJourneyHeatmap({ weeks }: StudentJourneyHeatmapProps) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-zinc-950 p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Heatmap da jornada
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500 sm:text-[11px]">
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-500/70" />
            Presente
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-red-500/70" />
            Falta
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-amber-500/70" />
            Atraso
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px] bg-sky-500/70" />
            Justif.
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-[2px] border border-zinc-500/25 bg-zinc-700/70" />
            Sem lanç.
          </span>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-zinc-500 lg:hidden">
        Deslize horizontalmente para ver toda a jornada.
      </p>

      <div className="mt-3 overflow-x-auto overscroll-x-contain scrollbar-hide">
        <div className="inline-flex min-w-max gap-2 pb-1">
          <div className="sticky left-0 z-10 shrink-0 bg-zinc-950 pt-6 pr-1 shadow-[6px_0_12px_-6px_rgba(0,0,0,0.9)]">
            <div className="grid auto-rows-[14px] gap-1.5">
              {journeyWeekDayLabels.map((label, index) => (
                <span
                  key={`weekday-${index}`}
                  className="flex h-3.5 w-4 items-center justify-center text-[10px] text-zinc-500 sm:text-[11px]"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="min-w-max">
            <div className="relative mb-2 flex gap-1.5">
              {weeks.map((week, weekIndex) => {
                const firstDay = week[0];
                const previousWeek = weekIndex > 0 ? weeks[weekIndex - 1] : null;
                const currentMonth = firstDay?.dateKey.slice(0, 7);
                const previousMonth = previousWeek?.[0]?.dateKey.slice(0, 7);
                const shouldShowMonth =
                  weekIndex === 0 || currentMonth !== previousMonth;

                return (
                  <div
                    key={`month-${weekIndex}`}
                    className="relative h-4 w-3.5 shrink-0 sm:w-4"
                  >
                    {shouldShowMonth && firstDay ? (
                      <span className="absolute left-0 top-0 whitespace-nowrap text-[10px] font-medium uppercase text-zinc-400 sm:text-[11px]">
                        {format(
                          new Date(`${firstDay.dateKey}T12:00:00`),
                          'MMM',
                          { locale: ptBR },
                        ).replace('.', '')}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-1.5">
              {weeks.map((week, weekIndex) => (
                <div
                  key={`heatmap-week-${weekIndex}`}
                  className="flex flex-col gap-1.5"
                >
                  {week.map((day) => (
                    <TooltipProvider key={day.dateKey} delayDuration={120}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'h-3.5 w-3.5 rounded-[3px] border sm:h-4 sm:w-4',
                              getJourneyHeatmapStatusClassName(
                                day.status,
                                day.isInRange,
                              ),
                            )}
                          />
                        </TooltipTrigger>

                        <TooltipContent className="border-white/10 bg-zinc-950 text-white">
                          <p className="text-xs leading-5">
                            {day.dayLabel}
                            {' · '}
                            {day.status
                              ? (journeyHeatmapStatusLabelMap[day.status] ??
                                day.status)
                              : day.isInRange
                                ? 'Sem lançamento'
                                : 'Fora da jornada'}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
