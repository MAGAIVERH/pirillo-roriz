import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';

import { PromoteStudentDialog } from '@/modules/students/components/promote-student-dialog';

import type { DashboardEligibleStudent } from '../types/dashboard';

type DashboardEligibleStudentsCardProps = {
  students: DashboardEligibleStudent[];
  totalCount: number;
};

export function DashboardEligibleStudentsCard({
  students,
  totalCount,
}: DashboardEligibleStudentsCardProps) {
  return (
    <section className="space-y-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/4 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Oportunidade
            </p>
            <h2 className="text-lg font-semibold text-white">
              {totalCount} aluno(s) apto(s) a graduar
            </h2>
            <p className="text-xs text-zinc-400">
              Aprove a promoção individualmente — a faixa é atualizada em todos
              os módulos do sistema.
            </p>
          </div>
        </div>

        {totalCount > students.length && (
          <Link
            href="/admin/alunos"
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            Ver todos
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </header>

      {students.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          Nenhum aluno apto a graduar no momento.
        </p>
      ) : (
        <ul className="space-y-2">
          {students.map((student) => (
            <li
              key={student.studentId}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-950/70 p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <Link
                  href={`/admin/alunos/${student.studentId}`}
                  className="truncate text-sm font-semibold text-white transition hover:text-emerald-300"
                >
                  {student.fullName}
                </Link>
                <p className="text-xs text-zinc-400">
                  <span className="text-zinc-200">{student.fromLabel}</span>
                  <span className="mx-2 text-zinc-500">→</span>
                  <span className="text-emerald-400">{student.toLabel}</span>
                </p>
                <p className="text-[11px] text-zinc-500">
                  {student.attendances} presença(s)
                  {student.projectedDate
                    ? ` · elegível desde ${student.projectedDate}`
                    : ''}
                </p>
              </div>

              <PromoteStudentDialog
                studentId={student.studentId}
                studentName={student.fullName}
                fromLabel={student.fromLabel}
                toLabel={student.toLabel}
                size="sm"
                triggerLabel="Graduar"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
