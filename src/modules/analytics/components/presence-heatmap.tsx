'use client';

import { Fragment, useEffect, useMemo, useRef } from 'react';
import { Users } from 'lucide-react';

import { formatPercent } from '../lib/analytics-helpers';
import type { PresenceCalendarDay, PresenceData } from '../types/analytics';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type PresenceHeatmapProps = {
  presence: PresenceData;
};

type DayCellProps = {
  day: PresenceCalendarDay;
  max: number;
};

function getCellTone(day: PresenceCalendarDay, max: number): string {
  if (!day.inMonth) {
    return 'bg-transparent';
  }

  if (day.isFuture) {
    return 'border border-dashed border-white/10 bg-zinc-950/40';
  }

  if (day.checkIns === 0) {
    return 'bg-zinc-900/80';
  }

  const intensity = max === 0 ? 0 : day.checkIns / max;

  if (intensity >= 0.8) return 'bg-red-500 text-white';
  if (intensity >= 0.6) return 'bg-red-500/70 text-white';
  if (intensity >= 0.4) return 'bg-red-500/45 text-white';
  if (intensity >= 0.2) return 'bg-red-500/25 text-red-100';
  return 'bg-red-500/10 text-red-200';
}

function formatDayTooltip(day: PresenceCalendarDay): string {
  if (!day.inMonth) return '';

  if (day.isFuture) {
    return `Dia ${day.dayOfMonth} — ainda não chegou`;
  }

  return `Dia ${day.dayOfMonth} — ${day.checkIns} check-in${day.checkIns !== 1 ? 's' : ''}`;
}

function DayCell({ day, max }: DayCellProps) {
  if (!day.inMonth) {
    return (
      <div
        className="size-[var(--week-col)] shrink-0 rounded-md md:rounded-[3px]"
        aria-hidden
      />
    );
  }

  const tone = getCellTone(day, max);
  const showCount = !day.isFuture && day.checkIns > 0;

  return (
    <div
      className={`flex size-[var(--week-col)] shrink-0 items-center justify-center rounded-md text-[10px] font-semibold transition md:rounded-[3px] md:text-[0px] ${tone} ${
        day.isToday
          ? 'ring-1 ring-red-500/70 ring-offset-1 ring-offset-zinc-950 md:ring-offset-0'
          : ''
      }`}
      title={formatDayTooltip(day)}
    >
      {showCount ? <span className="md:hidden">{day.checkIns}</span> : null}
    </div>
  );
}

export function PresenceHeatmap({ presence }: PresenceHeatmapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekCount = presence.calendarWeeks.length;

  const maxValue = useMemo(() => {
    let max = 0;

    for (const week of presence.calendarWeeks) {
      for (const day of week.days) {
        if (day.inMonth && !day.isFuture && day.checkIns > max) {
          max = day.checkIns;
        }
      }
    }

    return max;
  }, [presence.calendarWeeks]);

  const gridTemplateColumns = `1.75rem repeat(${weekCount}, var(--week-col))`;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    if (!presence.isCurrentMonth) {
      container.scrollLeft = 0;
      return;
    }

    if (container.scrollWidth > container.clientWidth) {
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    }
  }, [presence.isCurrentMonth, presence.calendarWeeks.length, presence.monthLabel]);

  return (
    <section className="min-w-0 space-y-4 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h3 className="text-base font-semibold text-white">
            Heatmap de frequência
          </h3>
          <p className="text-xs leading-5 text-zinc-500">
            Check-ins por dia em {presence.monthLabel}.
            <span className="md:hidden">
              {' '}
              Role lateralmente para ver todas as semanas.
            </span>
            {presence.isCurrentMonth ? (
              <span className="hidden md:inline">
                {' '}
                Dias futuros ficam vazios até receberem check-ins.
              </span>
            ) : null}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 rounded-xl border border-white/5 bg-zinc-900/40 px-3 py-2 text-[10px] text-zinc-500 sm:justify-end">
          <span className="whitespace-nowrap">Menos</span>
          <div className="flex gap-1">
            <span className="h-3 w-4 rounded bg-red-500/10" />
            <span className="h-3 w-4 rounded bg-red-500/25" />
            <span className="h-3 w-4 rounded bg-red-500/45" />
            <span className="h-3 w-4 rounded bg-red-500/70" />
            <span className="h-3 w-4 rounded bg-red-500" />
          </div>
          <span className="whitespace-nowrap">Mais</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide w-full overflow-x-auto overscroll-x-contain md:overflow-x-visible"
      >
        <div
          className="grid w-max min-w-full gap-1 [--week-col:2rem] md:gap-[3px] md:[--week-col:0.75rem]"
          style={{ gridTemplateColumns }}
        >
          <span className="h-5 md:h-3" aria-hidden />

          {presence.calendarWeeks.map((week) => (
            <span
              key={week.weekIndex}
              className="flex h-5 items-end justify-center whitespace-nowrap pb-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-zinc-400 md:h-3 md:pb-0 md:text-[8px]"
            >
              {week.label}
            </span>
          ))}

          {WEEKDAY_LABELS.map((label, rowIndex) => (
            <Fragment key={label}>
              <span className="flex items-center justify-end pr-0.5 text-[9px] font-medium text-zinc-500 md:pr-1 md:text-[8px]">
                {label}
              </span>

              {presence.calendarWeeks.map((week) => {
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
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {presence.isCurrentMonth ? (
        <p className="text-[11px] text-zinc-500 md:hidden">
          Dias futuros aparecem vazios e vão sendo preenchidos conforme os
          check-ins entram no mês.
        </p>
      ) : null}

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
    </section>
  );
}
