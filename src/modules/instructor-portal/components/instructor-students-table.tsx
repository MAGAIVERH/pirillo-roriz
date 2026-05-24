'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ChevronRight,
  GraduationCap,
  Mail,
  Phone,
  Search,
  Trophy,
  User,
  Users,
} from 'lucide-react';

import { StudentStatusBadge } from '@/modules/students/components/student-status-badge';
import type { InstructorStudentListItem } from '@/modules/instructor-portal/queries/get-instructor-students';

type InstructorStudentsTableProps = {
  students: InstructorStudentListItem[];
  emptyMessage?: string;
};

const progressStatusLabelMap: Record<string, string> = {
  ON_TRACK: 'No prazo',
  ELIGIBLE: 'Apto a graduar',
  POSTPONED: 'Postergado',
};

type StudentCardProps = {
  student: InstructorStudentListItem;
};

const StudentInfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-500">
      <Icon className="h-3.5 w-3.5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className="mt-0.5 wrap-break-word text-sm text-zinc-300">{value}</p>
    </div>
  </div>
);

const StudentCard = ({ student }: StudentCardProps) => {
  const progressLabel = student.progressStatus
    ? (progressStatusLabelMap[student.progressStatus] ?? student.progressStatus)
    : 'Sem progresso';

  return (
    <Link
      href={`/professor/alunos/${student.id}?turma=${student.classId}`}
      className="group flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-950 p-5 transition hover:border-red-500/30 hover:bg-zinc-900/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-white group-hover:text-red-300">
            {student.fullName}
          </p>
          <p className="mt-1 text-sm text-zinc-400">{student.belt}</p>
        </div>
        <StudentStatusBadge status={student.status} />
      </div>

      <div className="mt-5 space-y-4 border-t border-white/5 pt-5">
        <StudentInfoRow
          icon={Mail}
          label="E-mail"
          value={student.email}
        />
        <StudentInfoRow
          icon={Phone}
          label="Telefone"
          value={student.phone}
        />
        <StudentInfoRow
          icon={Users}
          label="Turma"
          value={student.className}
        />
        <StudentInfoRow
          icon={User}
          label="Idade"
          value={student.age !== null ? `${student.age} anos` : 'Não informada'}
        />
        <StudentInfoRow
          icon={GraduationCap}
          label="Progresso"
          value={`${progressLabel} · ${student.attendancesSincePromotion} presença(s)`}
        />
      </div>

      {student.isEligibleForPromotion ? (
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            <Trophy className="h-3.5 w-3.5" />
            Apto a graduar
          </span>
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-end pt-5 text-xs font-medium text-zinc-500 group-hover:text-red-400">
        Ver detalhes
        <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </div>
    </Link>
  );
};

export function InstructorStudentsTable({
  students,
  emptyMessage = 'Nenhum aluno encontrado.',
}: InstructorStudentsTableProps) {
  const [search, setSearch] = useState('');

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.fullName.toLowerCase().includes(normalizedSearch) ||
        student.email.toLowerCase().includes(normalizedSearch) ||
        student.phone.toLowerCase().includes(normalizedSearch) ||
        student.className.toLowerCase().includes(normalizedSearch) ||
        student.belt.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [search, students]);

  return (
    <div className="min-w-0 space-y-4">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">Lista de alunos</h2>
            <p className="text-sm text-zinc-400">
              Alunos matriculados nas suas turmas.
            </p>
          </div>

          <div className="flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 text-zinc-400 lg:max-w-sm">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, turma, faixa ou contato..."
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </div>
        </div>
      </section>

      {filteredStudents.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </section>
      ) : (
        <p className="py-10 text-center text-sm text-zinc-400">{emptyMessage}</p>
      )}
    </div>
  );
}
