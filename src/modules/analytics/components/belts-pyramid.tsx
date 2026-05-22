import { Trophy } from 'lucide-react';

import { getBeltStyle } from '../lib/belt-colors';
import { formatNumber } from '../lib/analytics-helpers';
import type { BeltDistributionEntry } from '../types/analytics';

type BeltsPyramidProps = {
  belts: BeltDistributionEntry[];
};

export function BeltsPyramid({ belts }: BeltsPyramidProps) {
  const orderedFromTop = [...belts].sort((a, b) => b.sortOrder - a.sortOrder);
  const total = belts.reduce((acc, entry) => acc + entry.students, 0);
  const maxStudents = Math.max(...belts.map((entry) => entry.students), 1);

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">
            Pirâmide de faixas
          </h3>
          <p className="text-xs text-zinc-500">
            Distribuição de alunos ativos por faixa atual.
          </p>
        </div>
        <p className="text-xs text-zinc-500">
          Total: <span className="font-semibold text-white">{total}</span>
        </p>
      </div>

      <ul className="space-y-3">
        {orderedFromTop.map((belt) => {
          const style = getBeltStyle(belt.beltName);
          const width = Math.max(
            8,
            Math.round((belt.students / maxStudents) * 100),
          );
          const percent = total === 0 ? 0 : Math.round((belt.students / total) * 100);

          return (
            <li key={belt.beltId} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-5 w-10 items-center justify-center rounded-md ring-1 ${style.bg} ${style.ring}`}
                  />
                  <span className="font-medium text-white">{belt.beltName}</span>
                  {belt.eligibleForPromotion > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <Trophy className="h-3 w-3" />
                      {belt.eligibleForPromotion} elegíveis
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-white">
                    {formatNumber(belt.students)}
                  </span>
                  <span className="text-zinc-500">{percent}%</span>
                </div>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
                <div
                  className={`h-full rounded-full ${style.bg} ${style.text}`}
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
