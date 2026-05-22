import { Users } from 'lucide-react';

import { formatPercent } from '../lib/analytics-helpers';
import type { PresenceData } from '../types/analytics';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/**
 * Janela operacional da academia: 10h às 22h.
 * Outros horários só aparecem se houver check-in real.
 */
const DEFAULT_HOURS = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

type PresenceHeatmapProps = {
  presence: PresenceData;
};

function getCellTone(value: number, max: number): string {
  if (value === 0) return 'bg-zinc-900/80 text-zinc-700';

  const intensity = max === 0 ? 0 : value / max;

  if (intensity >= 0.8) return 'bg-red-500 text-white';
  if (intensity >= 0.6) return 'bg-red-500/70 text-white';
  if (intensity >= 0.4) return 'bg-red-500/45 text-white';
  if (intensity >= 0.2) return 'bg-red-500/25 text-red-100';
  return 'bg-red-500/10 text-red-200';
}

function resolveHours(presence: PresenceData): number[] {
  const dynamicHours = new Set<number>(DEFAULT_HOURS);
  for (const cell of presence.heatmap) {
    if (cell.checkIns > 0) dynamicHours.add(cell.hour);
  }
  return Array.from(dynamicHours).sort((a, b) => a - b);
}

export function PresenceHeatmap({ presence }: PresenceHeatmapProps) {
  const map = new Map<string, number>();
  let maxValue = 0;

  for (const cell of presence.heatmap) {
    const key = `${cell.weekDay}-${cell.hour}`;
    map.set(key, cell.checkIns);
    if (cell.checkIns > maxValue) maxValue = cell.checkIns;
  }

  const hours = resolveHours(presence);

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-white">
            Heatmap de frequência
          </h3>
          <p className="text-xs text-zinc-500">
            Check-ins do mês por dia da semana e hora. Intensidade = volume.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
          <span>Menos</span>
          <div className="flex gap-1">
            <span className="h-3 w-4 rounded bg-red-500/10" />
            <span className="h-3 w-4 rounded bg-red-500/25" />
            <span className="h-3 w-4 rounded bg-red-500/45" />
            <span className="h-3 w-4 rounded bg-red-500/70" />
            <span className="h-3 w-4 rounded bg-red-500" />
          </div>
          <span>Mais</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px] space-y-1.5">
          <div className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] gap-1.5">
            <span />
            {WEEKDAY_LABELS.map((label) => (
              <span
                key={label}
                className="text-center text-[10px] font-semibold uppercase tracking-wide text-zinc-400"
              >
                {label}
              </span>
            ))}
          </div>

          {hours.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[44px_repeat(7,minmax(0,1fr))] items-center gap-1.5"
            >
              <span className="text-right text-[10px] font-medium text-zinc-500">
                {String(hour).padStart(2, '0')}h
              </span>
              {WEEKDAY_LABELS.map((_, weekDay) => {
                const value = map.get(`${weekDay}-${hour}`) ?? 0;
                const tone = getCellTone(value, maxValue);
                return (
                  <div
                    key={`${weekDay}-${hour}`}
                    className={`flex h-11 items-center justify-center rounded-lg text-xs font-semibold transition ${tone}`}
                    title={`${WEEKDAY_LABELS[weekDay]} ${String(hour).padStart(2, '0')}h — ${value} check-ins`}
                  >
                    {value || ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
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
        <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
          <p className="flex items-center gap-1 text-xs text-zinc-500">
            <Users className="h-3 w-3" /> Aula mais presente
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-white">
            {presence.topClass?.name ?? 'Sem dados'}
          </p>
          {presence.topClass?.schedule && (
            <p className="text-xs text-zinc-500">{presence.topClass.schedule}</p>
          )}
        </div>
      </div>
    </section>
  );
}
