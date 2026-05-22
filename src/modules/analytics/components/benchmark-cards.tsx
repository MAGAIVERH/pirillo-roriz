import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

import type { BenchmarkEntry, BenchmarkStatus } from '../types/analytics';

const statusConfig: Record<
  BenchmarkStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    wrapper: string;
    badge: string;
  }
> = {
  healthy: {
    label: 'Saudável',
    icon: CheckCircle2,
    wrapper: 'border-emerald-500/30 bg-emerald-500/5',
    badge: 'bg-emerald-500/15 text-emerald-400',
  },
  warning: {
    label: 'Atenção',
    icon: AlertTriangle,
    wrapper: 'border-amber-500/30 bg-amber-500/5',
    badge: 'bg-amber-500/15 text-amber-400',
  },
  risk: {
    label: 'Crítico',
    icon: XCircle,
    wrapper: 'border-red-500/30 bg-red-500/5',
    badge: 'bg-red-500/15 text-red-400',
  },
};

type BenchmarkCardsProps = {
  benchmarks: BenchmarkEntry[];
};

export function BenchmarkCards({ benchmarks }: BenchmarkCardsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Benchmarks de referência
          </h3>
          <p className="text-xs text-zinc-500">
            Comparativo com padrões de redes top (Gracie Barra, Alliance, Checkmat).
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {benchmarks.map((entry) => {
          const config = statusConfig[entry.status];
          const Icon = config.icon;

          return (
            <div
              key={entry.metric}
              className={`flex flex-col gap-3 rounded-2xl border p-5 ${config.wrapper}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-white">
                  {entry.metric}
                </p>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.badge}`}
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-zinc-500">
                  Referência: <span className="text-zinc-300">{entry.reference}</span>
                </p>
                <p className="text-2xl font-bold text-white">
                  {entry.currentLabel}
                </p>
              </div>

              <p className="text-xs leading-5 text-zinc-400">{entry.note}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
