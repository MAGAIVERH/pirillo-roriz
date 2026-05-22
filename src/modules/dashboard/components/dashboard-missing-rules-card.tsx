import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

import type { StudentMissingRule } from '@/modules/students/queries/get-students-missing-graduation-rule';

type DashboardMissingRulesCardProps = {
  students: StudentMissingRule[];
};

export function DashboardMissingRulesCard({
  students,
}: DashboardMissingRulesCardProps) {
  if (students.length === 0) return null;

  const groupedByBelt = new Map<
    string,
    { label: string; isKids: boolean; count: number }
  >();

  for (const student of students) {
    const beltLabel = student.degreeNumber
      ? `${student.beltName} · ${student.degreeNumber}º grau`
      : student.beltName;
    const key = `${student.isKids ? 'KIDS' : 'ADULT'}::${beltLabel}`;
    const existing = groupedByBelt.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      groupedByBelt.set(key, {
        label: beltLabel,
        isKids: student.isKids,
        count: 1,
      });
    }
  }

  const groups = Array.from(groupedByBelt.values()).sort(
    (a, b) => b.count - a.count,
  );

  return (
    <section className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">
              Configuração incompleta
            </p>
            <h2 className="text-lg font-semibold text-white">
              {students.length} aluno(s) sem regra de graduação aplicável
            </h2>
            <p className="text-xs text-zinc-400">
              Sem regra cadastrada para a faixa atual, esses alunos nunca
              ficam aptos para promoção.
            </p>
          </div>
        </div>

        <Link
          href="/admin/graduacao/regras"
          className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 transition hover:text-amber-300"
        >
          Configurar regras
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <ul className="grid gap-2 sm:grid-cols-2">
        {groups.map((group) => (
          <li
            key={`${group.label}-${group.isKids}`}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{group.label}</p>
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                {group.isKids ? 'Programa Kids' : 'Programa Adulto'}
              </p>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
              {group.count} aluno{group.count > 1 ? 's' : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
