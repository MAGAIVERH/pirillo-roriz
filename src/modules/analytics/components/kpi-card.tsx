import {
  type LucideIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import type { AnalyticsKpi } from '../types/analytics';

const toneClasses: Record<
  AnalyticsKpi['delta']['tone'],
  { wrapper: string; text: string }
> = {
  positive: {
    wrapper: 'bg-emerald-500/10 text-emerald-400',
    text: 'text-emerald-400',
  },
  negative: {
    wrapper: 'bg-red-500/10 text-red-400',
    text: 'text-red-400',
  },
  neutral: {
    wrapper: 'bg-amber-500/10 text-amber-400',
    text: 'text-amber-400',
  },
};

type KpiCardProps = {
  kpi: AnalyticsKpi;
  icon: LucideIcon;
};

export function KpiCard({ kpi, icon: Icon }: KpiCardProps) {
  const tone = toneClasses[kpi.delta.tone];
  const TrendIcon = kpi.delta.rawDiff >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-zinc-400">{kpi.title}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {kpi.value}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${tone.wrapper}`}
        >
          <TrendIcon className="h-3 w-3" />
          {kpi.delta.label}
        </span>
        <span className="text-xs text-zinc-500">vs mês anterior</span>
      </div>

      <p className="mt-2 text-xs leading-5 text-zinc-500">{kpi.description}</p>
    </div>
  );
}
