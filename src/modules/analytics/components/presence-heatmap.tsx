'use client';

import { Fragment, useEffect, useMemo, useRef } from 'react';
import { Users } from 'lucide-react';

import { formatPercent } from '../lib/analytics-helpers';
import type { PresenceCalendarDay, PresenceData } from '../types/analytics';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type PresenceHeatmapProps = {
  presence: PresenceData;
  showAcademySummary?: boolean;
};

type DayCellProps = {
  day: PresenceCalendarDay;
  max: number;
};

function getCellTone(day: PresenceCalendarDay, max: number): string {
  if (!day.isInWindow) {
    return 'bg-transparent';
  }

  if (day.isFuture) {
    return 'border border-dashed border-white/10 bg-zinc-950/40';
  }

  if (day.checkIns === 0) {
    return day.inMonth ? 'bg-zinc-900/80' : 'bg-zinc-900/50';
  }

  const intensity = max === 0 ? 0 : day.checkIns / max;

  if (intensity >= 0.8) return 'bg-red-500';
  if (intensity >= 0.6) return 'bg-red-500/70';
  if (intensity >= 0.4) return 'bg-red-500/45';
  if (intensity >= 0.2) return 'bg-red-500/25';
  return 'bg-red-500/10';
}

function formatDayTooltip(day: PresenceCalendarDay): string {
  if (!day.isInWindow) return '';

  if (day.isFuture) {
    return `Dia ${day.dayOfMonth} — ainda não chegou`;
  }

  return `Dia ${day.dayOfMonth} — ${day.checkIns} check-in${day.checkIns !== 1 ? 's' : ''}`;
}

function DayCell({ day, max }: DayCellProps) {
  const tone = getCellTone(day, max);
  const showCount =
    day.isInWindow && !day.isFuture && day.checkIns > 0 && day.inMonth;

  return (
    <div
      className={`size-[var(--week-col)] shrink-0 rounded-[4px] md:justify-self-center md:rounded-[2px] ${tone} ${
        day.isToday && day.isInWindow ? 'ring-1 ring-inset ring-red-400' : ''
      } ${day.isInWindow && !day.inMonth && !day.isFuture ? 'opacity-45' : ''}`}
      title={formatDayTooltip(day)}
    >
      {showCount ? (
        <span className="flex size-full items-center justify-center text-[10px] font-semibold text-white md:hidden">
          {day.checkIns}
        </span>
      ) : null}
    </div>
  );
}

export function PresenceHeatmap({
  presence,
  showAcademySummary = true,
}: PresenceHeatmapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekCount = presence.calendarWeeks.length;

  const maxValue = useMemo(() => {
    let max = 0;

    for (const week of presence.calendarWeeks) {
      for (const day of week.days) {
        if (day.isInWindow && !day.isFuture && day.checkIns > max) {
          max = day.checkIns;
        }
      }
    }

    return max;
  }, [presence.calendarWeeks]);

  const gridTemplateColumns = `var(--day-label) repeat(${weekCount}, var(--week-col))`;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (container.scrollWidth <= container.clientWidth) return;

    container.scrollLeft = container.scrollWidth - container.clientWidth;
  }, [presence.calendarWeeks.length, presence.monthLabel, presence.isCurrentMonth]);

  return (
    <section className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
      <style>{`
        @media (min-width: 768px) {
          .presence-heatmap-grid {
            grid-template-columns: var(--day-label) repeat(${weekCount}, minmax(var(--week-col), 1fr)) !important;
          }
        }
      `}</style>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold text-white">
            Heatmap de frequência
          </h3>
          <p className="text-xs leading-5 text-zinc-500">
            Últimas {weekCount} semanas com check-ins por dia. Destaque em{' '}
            {presence.monthLabel}.
            <span className="md:hidden">
              {' '}
              Role lateralmente para ver semanas anteriores.
            </span>
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 rounded-xl border border-white/5 bg-zinc-900/40 px-3 py-2 text-[10px] text-zinc-500 sm:justify-end">
          <span className="whitespace-nowrap">Menos</span>
          <div className="flex gap-1">
            <span className="size-3 rounded-[2px] bg-red-500/10 md:size-3.5" />
            <span className="size-3 rounded-[2px] bg-red-500/25 md:size-3.5" />
            <span className="size-3 rounded-[2px] bg-red-500/45 md:size-3.5" />
            <span className="size-3 rounded-[2px] bg-red-500/70 md:size-3.5" />
            <span className="size-3 rounded-[2px] bg-red-500 md:size-3.5" />
          </div>
          <span className="whitespace-nowrap">Mais</span>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-zinc-900/20 px-2 pb-3 pt-2 sm:px-3 sm:pb-4 sm:pt-3">
        {/* Mobile: coluna de dias fixa + semanas roláveis */}
        <div className="flex [--day-label:1.25rem] [--week-col:2rem] md:hidden">
          <div
            className="flex shrink-0 flex-col gap-1"
            style={{ width: 'var(--day-label)' }}
          >
            <span className="h-4 shrink-0" aria-hidden />
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="flex h-[var(--week-col)] shrink-0 items-center justify-end pr-1 text-[10px] font-medium text-zinc-500"
              >
                {label}
              </span>
            ))}
          </div>

          <div
            ref={scrollRef}
            className="min-w-0 flex-1 scrollbar-hide overflow-x-auto overscroll-x-contain"
          >
            <div
              className="inline-grid gap-1 pr-3 pb-2"
              style={{
                gridTemplateColumns: `repeat(${weekCount}, var(--week-col))`,
              }}
            >
              {presence.calendarWeeks.map((week) => (
                <span
                  key={week.weekIndex}
                  className="flex h-4 items-end justify-center text-[10px] font-medium capitalize leading-none text-zinc-500"
                >
                  {week.label}
                </span>
              ))}

              {WEEKDAY_LABELS.map((label, rowIndex) =>
                presence.calendarWeeks.map((week) => {
                  const day = week.days[rowIndex];

                  if (!day) {
                    return (
                      <div
                        key={`${week.weekIndex}-${label}`}
                        className="size-[var(--week-col)] shrink-0"
                        aria-hidden
                      />
                    );
                  }

                  return (
                    <DayCell key={day.dateKey} day={day} max={maxValue} />
                  );
                }),
              )}
            </div>
          </div>
        </div>

        {/* Desktop: grid único preenchendo a largura */}
        <div className="hidden md:block">
          <div
            className="presence-heatmap-grid grid w-full gap-1 [--day-label:1.75rem] [--week-col:14px]"
            style={{ gridTemplateColumns }}
          >
            <span className="h-3.5" aria-hidden />

            {presence.calendarWeeks.map((week) => (
              <span
                key={week.weekIndex}
                className="flex h-3.5 items-end justify-center text-[10px] font-medium capitalize leading-none text-zinc-500"
              >
                {week.label}
              </span>
            ))}

            {WEEKDAY_LABELS.map((label, rowIndex) => (
              <Fragment key={label}>
                <span className="flex h-[var(--week-col)] items-center justify-end pr-1.5 text-[10px] font-medium text-zinc-500">
                  {label}
                </span>

                {presence.calendarWeeks.map((week) => {
                  const day = week.days[rowIndex];

                  if (!day) {
                    return (
                      <div
                        key={`${week.weekIndex}-${label}`}
                        className="size-[var(--week-col)] shrink-0 justify-self-center"
                        aria-hidden
                      />
                    );
                  }

                  return (
                    <DayCell key={day.dateKey} day={day} max={maxValue} />
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-zinc-500">
        Dias fora de {presence.monthLabel} aparecem mais claros. No mês atual,
        dias futuros ficam vazios até receberem check-ins.
      </p>

      {showAcademySummary ? (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500">Frequência média geral</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatPercent(presence.attendanceRate, 0)}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
            <p className="text-xs text-zinc-500">Alunos com presença &lt; 50%</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {presence.studentsBelowHalfRate}
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 sm:col-span-2 md:col-span-1">
            <p className="flex items-center gap-1 text-xs text-zinc-500">
              <Users className="h-3 w-3 shrink-0" /> Aula mais presente
            </p>
            <p className="mt-1 truncate text-sm font-semibold text-white">
              {presence.topClass?.name ?? 'Sem dados'}
            </p>
            {presence.topClass?.schedule && (
              <p className="truncate text-xs text-zinc-500">
                {presence.topClass.schedule}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
