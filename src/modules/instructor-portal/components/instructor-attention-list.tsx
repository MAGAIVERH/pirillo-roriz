import Link from 'next/link';
import { ChevronRight, GraduationCap, TriangleAlert } from 'lucide-react';

import type { InstructorAttentionStudent } from '@/modules/instructor-portal/queries/get-instructor-dashboard-overview';

type InstructorAttentionListProps = {
  students: InstructorAttentionStudent[];
  eligibleCount: number;
  delinquentCount: number;
};

export function InstructorAttentionList({
  students,
  eligibleCount,
  delinquentCount,
}: InstructorAttentionListProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5">
      <div className="mb-4">
        <p className="text-sm font-medium text-white">Requer sua atenção</p>
        <p className="text-xs text-zinc-400">
          Alunos aptos a graduar ou inadimplentes nas suas turmas.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Link
          href="/professor/alunos?filtro=aptos"
          className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 transition hover:bg-emerald-500/10"
        >
          <p className="text-[11px] uppercase tracking-wide text-emerald-400/80">
            Aptos
          </p>
          <p className="text-xl font-bold text-emerald-300">{eligibleCount}</p>
        </Link>
        <Link
          href="/professor/alunos?filtro=inadimplentes"
          className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 transition hover:bg-amber-500/10"
        >
          <p className="text-[11px] uppercase tracking-wide text-amber-400/80">
            Inadimplentes
          </p>
          <p className="text-xl font-bold text-amber-300">{delinquentCount}</p>
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/40 p-6 text-center">
          <GraduationCap className="mx-auto h-6 w-6 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-400">
            Nenhum aluno pendente no momento.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/professor/alunos/${student.id}?turma=${student.classId}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-3 transition hover:border-white/20 hover:bg-zinc-900"
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  student.reason === 'eligible'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-amber-500/15 text-amber-400'
                }`}
              >
                {student.reason === 'eligible' ? (
                  <GraduationCap className="h-4 w-4" />
                ) : (
                  <TriangleAlert className="h-4 w-4" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">
                  {student.fullName}
                </p>
                <p className="truncate text-xs text-zinc-400">
                  {student.belt} · {student.className}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
