import type { ComparisonRow } from '../types/analytics';

type ComparisonTableProps = {
  rows: ComparisonRow[];
  previousLabel: string;
  currentLabel: string;
};

type ComparisonMobileCardProps = {
  row: ComparisonRow;
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

const ComparisonMobileCard = ({ row }: ComparisonMobileCardProps) => {
  return (
    <article className="rounded-xl border border-white/10 bg-zinc-950 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 font-medium text-white">{row.metric}</p>
        <span
          className={`mt-1 inline-block h-2.5 w-2.5 shrink-0 rounded-full ${toneDot[row.delta.tone]}`}
          aria-hidden
        />
      </div>

      <dl className="mt-3 space-y-2 border-t border-white/5 pt-3 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-zinc-500">Anterior</dt>
          <dd className="truncate text-right text-zinc-300">
            {row.previousLabel}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-zinc-500">Atual</dt>
          <dd className="truncate text-right font-semibold text-white">
            {row.currentLabel}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-3">
          <dt className="text-zinc-500">Variação</dt>
          <dd
            className={`truncate text-right font-semibold ${toneClasses[row.delta.tone]}`}
          >
            {row.delta.label}
          </dd>
        </div>
      </dl>
    </article>
  );
};

export function ComparisonTable({
  rows,
  previousLabel,
  currentLabel,
}: ComparisonTableProps) {
  return (
    <section className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">
          Comparativo mês a mês
        </h3>
        <p className="text-xs text-zinc-500">
          Variação do mês atual em relação ao anterior.
        </p>
      </div>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <ComparisonMobileCard key={row.metric} row={row} />
        ))}
      </div>

      {/* Desktop: tabela */}
      <div className="hidden overflow-hidden rounded-2xl border border-white/10 md:block">
        <table className="w-full border-collapse">
          <thead className="bg-zinc-900/70">
            <tr className="border-b border-white/10 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Métrica
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                {previousLabel}
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                {currentLabel}
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Variação
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.metric}
                className="border-b border-white/10 text-sm transition hover:bg-zinc-900/40"
              >
                <td className="px-5 py-3.5 font-medium text-white">
                  {row.metric}
                </td>
                <td className="px-5 py-3.5 text-right text-zinc-400">
                  {row.previousLabel}
                </td>
                <td className="px-5 py-3.5 text-right font-semibold text-white">
                  {row.currentLabel}
                </td>
                <td
                  className={`px-5 py-3.5 text-right font-semibold ${toneClasses[row.delta.tone]}`}
                >
                  {row.delta.label}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${toneDot[row.delta.tone]}`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
