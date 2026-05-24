'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  CalendarClock,
  Check,
  Clock3,
  Loader2,
  QrCode,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { markInstructorSessionAttendanceAction } from '@/modules/instructor-portal/actions/mark-instructor-session-attendance';
import type {
  InstructorTodayAttendanceOverview,
  InstructorTodayAttendanceSlot,
} from '@/modules/instructor-portal/queries/get-instructor-today-attendance';
import {
  INSTRUCTOR_ATTENDANCE_STATUS,
  instructorAttendanceStatusLabelMap,
  isPresentAttendanceStatus,
} from '@/modules/instructor-portal/types/attendance-status';

type InstructorTodayAttendancePanelProps = {
  attendance: InstructorTodayAttendanceOverview;
};

const phaseLabelMap = {
  upcoming: 'Próxima aula',
  ongoing: 'Aula em andamento',
  finished: 'Aula encerrada',
} as const;

const phaseStyles = {
  upcoming: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
  ongoing: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300',
  finished: 'border-white/10 bg-zinc-900/60 text-zinc-400',
} as const;

const attendanceStatusLabelMap = instructorAttendanceStatusLabelMap;

type AttendanceSlotSectionProps = {
  slot: InstructorTodayAttendanceSlot;
  onMarkAttendance: (sessionId: string, studentId: string) => void;
  pendingStudentId: string | null;
  readOnly?: boolean;
};

const AttendanceSlotSection = ({
  slot,
  onMarkAttendance,
  pendingStudentId,
  readOnly = false,
}: AttendanceSlotSectionProps) => {
  const presentCount = slot.students.filter((student) =>
    isPresentAttendanceStatus(student.attendanceStatus),
  ).length;

  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-white">{slot.className}</p>
            <span
              className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${phaseStyles[slot.phase]}`}
            >
              {phaseLabelMap[slot.phase]}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-zinc-400">{slot.classType}</p>
        </div>

        <div className="text-right text-sm text-zinc-400">
          <p className="flex items-center justify-end gap-1.5">
            <Clock3 className="h-3.5 w-3.5 text-red-500" />
            {slot.startTime} – {slot.endTime}
          </p>
          <p className="mt-1 flex items-center justify-end gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" />
            {presentCount}/{slot.students.length} presentes
          </p>
        </div>
      </div>

      {slot.students.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-white/10 px-4 py-6 text-center text-sm text-zinc-400">
          Nenhum aluno matriculado nesta turma.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
          <div className="grid grid-cols-[1fr_auto_auto] border-b border-white/10 bg-zinc-900 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
            <span>Aluno</span>
            <span className="hidden sm:block">Status</span>
            <span className="text-right">Ação</span>
          </div>

          <div className="divide-y divide-white/10">
            {slot.students.map((student) => {
              const isPending = pendingStudentId === student.id;
              const isPresent = isPresentAttendanceStatus(
                student.attendanceStatus,
              );
              const isAbsent =
                student.attendanceStatus === INSTRUCTOR_ATTENDANCE_STATUS.ABSENT;

              return (
                <div
                  key={student.id}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/professor/alunos/${student.id}?turma=${slot.classId}`}
                      className="truncate text-sm font-medium text-white transition hover:text-red-400"
                    >
                      {student.fullName}
                    </Link>
                    <p className="truncate text-xs text-zinc-400">{student.belt}</p>
                    {!student.canReceiveAttendance ? (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-400">
                        <TriangleAlert className="h-3 w-3" />
                        Inadimplente — presença bloqueada
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide sm:inline-flex ${
                      isPresent
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : isAbsent
                          ? 'border-red-500/30 bg-red-500/10 text-red-400'
                          : 'border-white/10 bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {student.attendanceStatus
                      ? attendanceStatusLabelMap[student.attendanceStatus]
                      : 'Pendente'}
                  </span>

                  <div className="flex justify-end">
                    {readOnly || slot.phase === 'finished' ? (
                      <span className="text-xs text-zinc-500">
                        {student.attendanceStatus
                          ? attendanceStatusLabelMap[student.attendanceStatus]
                          : '—'}
                      </span>
                    ) : isPresent ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        OK
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isPending || !student.canReceiveAttendance}
                        onClick={() =>
                          onMarkAttendance(slot.sessionId, student.id)
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-600/15 px-3 text-xs font-medium text-red-300 transition hover:bg-red-600/25 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Marcar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export function InstructorTodayAttendancePanel({
  attendance,
}: InstructorTodayAttendancePanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingStudentId, setPendingStudentId] = useState<string | null>(null);

  const handleMarkAttendance = (sessionId: string, studentId: string) => {
    setPendingStudentId(studentId);

    startTransition(async () => {
      const result = await markInstructorSessionAttendanceAction({
        sessionId,
        studentId,
        status: INSTRUCTOR_ATTENDANCE_STATUS.PRESENT,
      });

      setPendingStudentId(null);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Aulas de hoje</p>
          <p className="text-xs text-zinc-400">
            Agenda de presença atualizada conforme o horário da aula.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/professor/qr-code"
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-600/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-600/20"
          >
            <QrCode className="h-3.5 w-3.5" />
            Ler QR Code
          </Link>
          <Link
            href="/professor/turmas"
            className="text-xs font-medium text-red-400 transition hover:text-red-300"
          >
            Ver turmas
          </Link>
        </div>
      </div>

      {!attendance.hasAnyScheduleToday ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/40 p-6 text-center">
          <CalendarClock className="mx-auto h-6 w-6 text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-400">
            Nenhuma aula agendada para hoje.
          </p>
        </div>
      ) : attendance.activeSlots.length === 0 ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-white/10 bg-zinc-900/40 p-6 text-center">
            <Clock3 className="mx-auto h-6 w-6 text-zinc-600" />
            <p className="mt-2 text-sm text-zinc-400">
              Nenhuma aula ativa no momento. As aulas encerradas aparecem abaixo.
            </p>
          </div>

          {attendance.finishedSlots.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Aulas encerradas hoje
              </p>
              {attendance.finishedSlots.map((slot) => (
                <AttendanceSlotSection
                  key={`${slot.sessionId}-${slot.scheduleId}`}
                  slot={slot}
                  onMarkAttendance={handleMarkAttendance}
                  pendingStudentId={pendingStudentId}
                  readOnly
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          {attendance.activeSlots.map((slot) => (
            <AttendanceSlotSection
              key={`${slot.sessionId}-${slot.scheduleId}`}
              slot={slot}
              onMarkAttendance={handleMarkAttendance}
              pendingStudentId={isPending ? pendingStudentId : null}
            />
          ))}

          {attendance.finishedSlots.length > 0 ? (
            <details className="rounded-xl border border-white/10 bg-zinc-900/30">
              <summary className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Aulas encerradas hoje ({attendance.finishedSlots.length})
              </summary>
              <div className="space-y-3 border-t border-white/10 p-4">
                {attendance.finishedSlots.map((slot) => (
                  <AttendanceSlotSection
                    key={`${slot.sessionId}-${slot.scheduleId}`}
                    slot={slot}
                    onMarkAttendance={handleMarkAttendance}
                    pendingStudentId={pendingStudentId}
                    readOnly
                  />
                ))}
              </div>
            </details>
          ) : null}
        </div>
      )}
    </section>
  );
}
