import { Target } from 'lucide-react';

import { formatNumber, formatPercent } from '../lib/analytics-helpers';
import type { AcquisitionFunnel } from '../types/analytics';

type AcquisitionFunnelProps = {
  funnel: AcquisitionFunnel;
};

function widthForStep(count: number, max: number): number {
  if (max === 0) return 0;
  return Math.max(8, Math.round((count / max) * 100));
}

export function AcquisitionFunnelView({ funnel }: AcquisitionFunnelProps) {
  const maxCount = funnel.steps[0]?.count ?? 0;
  const meetsGoal =
    funnel.finalConversionPercent >= funnel.goalConversionPercent;

  return (
    <section className="grid gap-6 rounded-2xl border border-white/10 bg-zinc-950 p-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-semibold text-white">
              Funil de aquisição
            </h3>
            <p className="text-xs text-zinc-500">
              Da chegada do lead até a matrícula no mês.
            </p>
          </div>
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              meetsGoal
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-amber-500/15 text-amber-400'
            }`}
          >
            <Target className="h-3 w-3" />
            {formatPercent(funnel.finalConversionPercent, 0)} · meta{' '}
            {funnel.goalConversionPercent}%
          </div>
        </div>

        <div className="space-y-3">
          {funnel.steps.map((step) => {
            const width = widthForStep(step.count, maxCount);
            return (
              <div key={step.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-white">{step.label}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-white">
                      {formatNumber(step.count)}
                    </span>
                    {step.conversionPercent !== null && (
                      <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-300">
                        {step.conversionPercent}% conv.
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-red-500 to-red-600"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-white/5 bg-zinc-900/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
          Origem dos leads
        </p>
        {funnel.sources.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nenhum lead recebido no período.
          </p>
        ) : (
          <ul className="space-y-2">
            {funnel.sources.map((source) => {
              const total =
                funnel.sources.reduce((acc, item) => acc + item.count, 0) ?? 1;
              const percent = Math.round((source.count / total) * 100);
              return (
                <li key={source.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="truncate text-zinc-300">{source.name}</span>
                    <span className="font-semibold text-white">
                      {source.count} ({percent}%)
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
                    <div
                      className="h-full bg-red-500/70"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
