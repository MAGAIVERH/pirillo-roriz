import {
  CalendarCheck2,
  QrCode,
  TriangleAlert,
  UserRound,
} from 'lucide-react';

import type { StudentAttendancePortalOverview } from '@/modules/attendance/queries/get-student-attendance-portal';
import { StudentQrDisplay } from '@/modules/student-portal/components/student-qr-display';

type StudentAttendancePortalViewProps = {
  studentName: string;
  overview: StudentAttendancePortalOverview;
};

const statusLabelMap = {
  PRESENT: 'Presente',
  ABSENT: 'Faltou',
  LATE: 'Atrasado',
  EXCUSED: 'Justificado',
} as const;

const statusClassMap = {
  PRESENT: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  ABSENT: 'border-red-500/30 bg-red-500/10 text-red-400',
  LATE: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  EXCUSED: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
} as const;

export function StudentAttendancePortalView({
  studentName,
  overview,
}: StudentAttendancePortalViewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Presença
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Olá, {studentName}
        </h1>
        <p className="mt-2 text-sm leading-7 text-zinc-400">
          Use seu QR Code para registrar presença na aula e acompanhe seu
          histórico abaixo.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-white">Meu QR Code</p>
              <p className="text-xs text-zinc-400">Check-in na academia</p>
            </div>
          </div>

          <StudentQrDisplay
            qrPayload={overview.qrPayload}
            studentName={studentName}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CalendarCheck2 className="h-4 w-4" />
            </div>
            <p className="mt-4 text-2xl font-bold text-white">
              {overview.stats.attendancesSincePromotion}
            </p>
            <p className="text-sm text-zinc-400">Presenças desde a faixa</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              <TriangleAlert className="h-4 w-4" />
            </div>
            <p className="mt-4 text-2xl font-bold text-white">
              {overview.stats.absencesSincePromotion}
            </p>
            <p className="text-sm text-zinc-400">Faltas desde a faixa</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
              <UserRound className="h-4 w-4" />
            </div>
            <p className="mt-4 text-2xl font-bold text-white">
              {overview.stats.monthPresentCount}
            </p>
            <p className="text-sm text-zinc-400">Presenças neste mês</p>
          </article>

          <article className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <TriangleAlert className="h-4 w-4" />
            </div>
            <p className="mt-4 text-2xl font-bold text-white">
              {overview.stats.monthAbsentCount}
            </p>
            <p className="text-sm text-zinc-400">Faltas neste mês</p>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <h2 className="text-lg font-semibold text-white">Histórico recente</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Atualizado automaticamente após check-in manual, QR Code ou ajuste do
          admin.
        </p>

        {overview.recentAttendances.length > 0 ? (
          <div className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10">
            {overview.recentAttendances.map((attendance) => {
              const statusLabel =
                statusLabelMap[attendance.status as keyof typeof statusLabelMap] ??
                attendance.status;
              const statusClass =
                statusClassMap[attendance.status as keyof typeof statusClassMap] ??
                statusClassMap.EXCUSED;

              return (
                <article
                  key={attendance.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-white">
                      {attendance.className}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">
                      {attendance.dateLabel} · {attendance.source}
                    </p>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
            Nenhuma presença registrada ainda.
          </div>
        )}
      </section>
    </div>
  );
}
