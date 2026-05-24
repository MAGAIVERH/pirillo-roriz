import Link from 'next/link';
import { CalendarClock, ChevronRight, Users } from 'lucide-react';

import type { InstructorTodayClassItem } from '@/modules/instructor-portal/queries/get-instructor-dashboard-overview';

type InstructorTodayClassesProps = {
  classes: InstructorTodayClassItem[];
};

export function InstructorTodayClasses({ classes }: InstructorTodayClassesProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Aulas de hoje</p>
          <p className="text-xs text-zinc-400">
            Turmas com horário agendado para hoje.
          </p>
        </div>
        <Link
          href="/professor/turmas"
          className="text-xs font-medium text-red-400 transition hover:text-red-300"
        >
          Ver turmas
        </Link>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/40 p-6 text-center">
          <CalendarClock className="mx-auto h-6 w-6 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-400">
            Nenhuma aula agendada para hoje.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map((classItem) => (
            <Link
              key={classItem.id}
              href={`/professor/turmas/${classItem.id}`}
              className="block rounded-xl border border-white/10 bg-zinc-900/60 p-4 transition hover:border-red-500/30 hover:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{classItem.name}</p>
                  <p className="mt-0.5 text-sm text-zinc-400">{classItem.type}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
              </div>

              <div className="mt-3 space-y-1.5">
                {classItem.schedules.map((schedule) => (
                  <p
                    key={schedule}
                    className="flex items-center gap-2 text-sm text-zinc-300"
                  >
                    <CalendarClock className="h-3.5 w-3.5 text-red-500" />
                    {schedule}
                  </p>
                ))}
              </div>

              <p className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                <Users className="h-3.5 w-3.5" />
                {classItem.enrollmentsCount} aluno(s) matriculado(s)
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
