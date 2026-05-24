'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CalendarClock,
  CalendarDays,
  ChevronRight,
  Search,
  User,
  Users,
} from 'lucide-react';

import type { InstructorClassListItem } from '@/modules/instructor-portal/queries/get-instructor-classes';

type InstructorClassesTableProps = {
  classes: InstructorClassListItem[];
};

const ClassStatusBadge = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex w-fit shrink-0 justify-center rounded-full border px-3 py-1 text-xs font-medium ${
      active
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
        : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-300'
    }`}
  >
    {active ? 'Ativa' : 'Inativa'}
  </span>
);

type ClassCardProps = {
  classItem: InstructorClassListItem;
};

const ClassCard = ({ classItem }: ClassCardProps) => {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/professor/turmas/${classItem.id}`}
            className="truncate text-base font-semibold text-white transition hover:text-red-400"
          >
            {classItem.name}
          </Link>
          <p className="mt-1 text-sm text-zinc-400">{classItem.type}</p>
        </div>
        <ClassStatusBadge active={classItem.active} />
      </div>

      <div className="mt-5 space-y-4 border-t border-white/5 pt-5">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600/15 text-red-500">
              <CalendarClock className="h-3.5 w-3.5" />
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Horários
            </p>
          </div>

          <div className="space-y-2 pl-10">
            {classItem.schedules.map((schedule) => (
              <p key={schedule} className="text-sm text-zinc-300">
                {schedule}
              </p>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600/15 text-red-500">
                <Users className="h-3.5 w-3.5" />
              </div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Alunos matriculados
              </p>
            </div>
            <span className="text-xs text-zinc-500">
              {classItem.enrollmentsCount} aluno(s)
            </span>
          </div>

          {classItem.students.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-zinc-400">
              Nenhum aluno matriculado nesta turma.
            </p>
          ) : (
            <div className="space-y-2">
              {classItem.students.map((student) => (
                <Link
                  key={student.id}
                  href={`/professor/alunos/${student.id}?turma=${classItem.id}`}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/50 px-3 py-2.5 transition hover:border-red-500/30 hover:bg-zinc-900"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-500">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {student.fullName}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {student.belt}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-zinc-500" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-white/5 pt-4">
        <Link
          href={`/professor/turmas/${classItem.id}`}
          className="inline-flex items-center text-xs font-medium text-zinc-500 transition hover:text-red-400"
        >
          Ver detalhes da turma
          <ChevronRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
};

export function InstructorClassesTable({
  classes,
}: InstructorClassesTableProps) {
  const [search, setSearch] = useState('');

  const filteredClasses = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return classes;
    }

    return classes.filter((item) => {
      return (
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.type.toLowerCase().includes(normalizedSearch) ||
        item.schedules.some((schedule) =>
          schedule.toLowerCase().includes(normalizedSearch),
        ) ||
        item.students.some((student) =>
          student.fullName.toLowerCase().includes(normalizedSearch),
        )
      );
    });
  }, [search, classes]);

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

  const gridClassName =
    filteredClasses.length === 1
      ? 'mx-auto grid w-full max-w-md gap-4'
      : filteredClasses.length === 2
        ? 'mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2'
        : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <div className="min-w-0 space-y-4">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Lista de turmas</h2>
            <p className="text-sm text-zinc-400">
              Turmas vinculadas a você com horários e alunos matriculados.
            </p>
          </div>

          <div className="flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 text-zinc-400 lg:max-w-sm">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por turma, horário ou aluno..."
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>
      </section>

      {filteredClasses.length > 0 ? (
        <section className={gridClassName}>
          {filteredClasses.map((classItem) => (
            <ClassCard key={classItem.id} classItem={classItem} />
          ))}
        </section>
      ) : (
        <p className="py-10 text-center text-sm text-zinc-400">
          Nenhuma turma encontrada para a busca informada.
        </p>
      )}
    </div>
  );
}
