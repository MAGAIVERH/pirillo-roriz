'use client';

import Link from 'next/link';
import { CalendarClock, CalendarDays, ChevronRight, Users } from 'lucide-react';

import type { InstructorClassListItem } from '@/modules/instructor-portal/queries/get-instructor-classes';

type InstructorClassesTableProps = {
  classes: InstructorClassListItem[];
};

type ClassCardProps = {
  classItem: InstructorClassListItem;
};

const ClassCard = ({ classItem }: ClassCardProps) => {
  return (
    <Link
      href={`/professor/turmas/${classItem.id}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-zinc-950 p-5 transition hover:border-red-500/30 hover:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-white group-hover:text-red-300">
            {classItem.name}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{classItem.type}</p>
        </div>

        <span
          className={`inline-flex shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            classItem.active
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400'
          }`}
        >
          {classItem.active ? 'Ativa' : 'Inativa'}
        </span>
      </div>

      <div className="mt-4 space-y-2 border-t border-white/5 pt-4">
        <p className="flex items-center gap-2 text-sm text-zinc-300">
          <Users className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
          {classItem.enrollmentsCount} aluno(s) · {classItem.capacity}
        </p>

        {classItem.schedules.map((schedule) => (
          <p
            key={schedule}
            className="flex items-center gap-2 text-sm text-zinc-300"
          >
            <CalendarClock className="h-3.5 w-3.5 shrink-0 text-red-500" />
            <span className="truncate">{schedule}</span>
          </p>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end text-xs font-medium text-zinc-500 group-hover:text-red-400">
        Ver alunos
        <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </div>
    </Link>
  );
};

export function InstructorClassesTable({
  classes,
}: InstructorClassesTableProps) {
  if (classes.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 text-center">
        <CalendarDays className="mx-auto h-8 w-8 text-zinc-600" />
        <p className="mt-3 text-sm font-medium text-white">
          Nenhuma turma vinculada
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Quando o admin vincular turmas a você, elas aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {classes.map((classItem) => (
        <ClassCard key={classItem.id} classItem={classItem} />
      ))}
    </section>
  );
}
