'use client';

import Link from 'next/link';
import {
  CalendarClock,
  ChevronRight,
  GraduationCap,
  Trophy,
  User,
  Users,
} from 'lucide-react';

import { StudentStatusBadge } from '@/modules/students/components/student-status-badge';
import type { InstructorClassStudentItem } from '@/modules/instructor-portal/queries/get-instructor-class-detail';

type InstructorClassScheduleItem = {
  id: string;
  weekDayLabel: string;
  startTime: string;
  endTime: string;
};

type InstructorClassSchedulesSectionProps = {
  schedules: InstructorClassScheduleItem[];
};

export function InstructorClassSchedulesSection({
  schedules,
}: InstructorClassSchedulesSectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
          <CalendarClock className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Horários da turma</h2>
          <p className="text-xs text-zinc-400">
            Dias e horários em que esta turma acontece.
          </p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/40 px-4 py-6 text-center text-sm text-zinc-400">
          Nenhum horário cadastrado para esta turma.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600/10 text-red-400">
                <CalendarClock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">
                  {schedule.weekDayLabel}
                </p>
                <p className="text-sm text-zinc-400">
                  {schedule.startTime} – {schedule.endTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

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
  const progressLabel = student.progressStatus
    ? (progressStatusLabelMap[student.progressStatus] ?? student.progressStatus)
    : 'Sem progresso';

  const isEligible =
    student.progressStatus === 'ELIGIBLE' && student.status === 'ACTIVE';

  return (
    <Link
      href={`/professor/alunos/${student.id}?turma=${classId}`}
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

      <div className="mt-5 space-y-3 border-t border-white/5 pt-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-500">
            <GraduationCap className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Progresso
            </p>
            <p className="mt-0.5 text-sm text-zinc-300">{progressLabel}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-zinc-500">
            <User className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Presenças
            </p>
            <p className="mt-0.5 text-sm text-zinc-300">
              {student.attendancesSincePromotion} desde a última graduação
            </p>
          </div>
        </div>
      </div>

      {isEligible ? (
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-400">
            <Trophy className="h-3.5 w-3.5" />
            Apto a graduar
          </span>
        </div>
      ) : null}

      <div className="mt-auto flex items-center justify-end pt-5 text-xs font-medium text-zinc-500 group-hover:text-red-400">
        Ver detalhes do aluno
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

  const gridClassName =
    students.length === 1
      ? 'mx-auto grid w-full max-w-md gap-4'
      : students.length === 2
        ? 'mx-auto grid w-full max-w-5xl gap-4 sm:grid-cols-2'
        : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <section className={gridClassName}>
      {students.map((student) => (
        <StudentCard key={student.id} classId={classId} student={student} />
      ))}
    </section>
  );
}
