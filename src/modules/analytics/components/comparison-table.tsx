import type { ComparisonRow } from '../types/analytics';

type ComparisonTableProps = {
  rows: ComparisonRow[];
  previousLabel: string;
  currentLabel: string;
};

const toneClasses: Record<ComparisonRow['delta']['tone'], string> = {
  positive: 'text-emerald-400',
  negative: 'text-red-400',
  neutral: 'text-amber-400',
};

const toneDot: Record<ComparisonRow['delta']['tone'], string> = {
  positive: 'bg-emerald-400',
  negative: 'bg-red-400',
  neutral: 'bg-amber-400',
};

export function ComparisonTable({
  rows,
  previousLabel,
  currentLabel,
}: ComparisonTableProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">
          Comparativo mês a mês
        </h3>
        <p className="text-xs text-zinc-500">
          Variação do mês atual em relação ao anterior.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[1.5fr_repeat(4,1fr)] border-b border-white/10 bg-zinc-900 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
          <span>Métrica</span>
          <span className="text-right">{previousLabel}</span>
          <span className="text-right">{currentLabel}</span>
          <span className="text-right">Variação</span>
          <span className="text-center">Status</span>
        </div>

        <div className="divide-y divide-white/10">
          {rows.map((row) => (
            <div
              key={row.metric}
              className="grid grid-cols-[1.5fr_repeat(4,1fr)] items-center px-6 py-3.5 text-sm"
            >
              <span className="font-medium text-white">{row.metric}</span>
              <span className="text-right text-zinc-400">{row.previousLabel}</span>
              <span className="text-right font-semibold text-white">
                {row.currentLabel}
              </span>
              <span
                className={`text-right font-semibold ${toneClasses[row.delta.tone]}`}
              >
                {row.delta.label}
              </span>
              <span className="flex justify-center">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${toneDot[row.delta.tone]}`}
                />
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
