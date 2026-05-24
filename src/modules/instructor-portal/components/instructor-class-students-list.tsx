'use client';

import Link from 'next/link';
import { ChevronRight, GraduationCap, Trophy, Users } from 'lucide-react';

import { StudentStatusBadge } from '@/modules/students/components/student-status-badge';
import type { InstructorClassStudentItem } from '@/modules/instructor-portal/queries/get-instructor-class-detail';

type InstructorClassStudentsListProps = {
  classId: string;
  students: InstructorClassStudentItem[];
};

const progressStatusLabelMap: Record<string, string> = {
  ON_TRACK: 'No prazo',
  ELIGIBLE: 'Apto a graduar',
  POSTPONED: 'Postergado',
};

type StudentCardProps = {
  classId: string;
  student: InstructorClassStudentItem;
};

const StudentCard = ({ classId, student }: StudentCardProps) => {
  const isEligible =
    student.progressStatus === 'ELIGIBLE' && student.status === 'ACTIVE';

  return (
    <Link
      href={`/professor/alunos/${student.id}?turma=${classId}`}
      className="group flex flex-col rounded-2xl border border-white/10 bg-zinc-950 p-5 transition hover:border-red-500/30 hover:bg-zinc-900/60"
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

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
        {isEligible ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            <Trophy className="h-3 w-3" />
            Apto a graduar
          </span>
        ) : null}

        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          <GraduationCap className="h-3 w-3" />
          {student.progressStatus
            ? (progressStatusLabelMap[student.progressStatus] ??
              student.progressStatus)
            : 'Sem progresso'}
        </span>

        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900 px-2.5 py-1 text-[10px] font-medium text-zinc-300">
          {student.attendancesSincePromotion} presença(s)
        </span>
      </div>

      <div className="mt-4 flex items-center justify-end text-xs font-medium text-zinc-500 group-hover:text-red-400">
        Lançar presença
        <ChevronRight className="ml-1 h-3.5 w-3.5" />
      </div>
    </Link>
  );
};

export function InstructorClassStudentsList({
  classId,
  students,
}: InstructorClassStudentsListProps) {
  if (students.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-zinc-950 p-8 text-center">
        <Users className="mx-auto h-8 w-8 text-zinc-600" />
        <p className="mt-3 text-sm font-medium text-white">
          Nenhum aluno matriculado
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          Quando alunos forem matriculados nesta turma, eles aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {students.map((student) => (
        <StudentCard key={student.id} classId={classId} student={student} />
      ))}
    </section>
  );
}
