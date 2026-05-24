import { PresenceHeatmap } from '@/modules/analytics/components/presence-heatmap';
import type { StudentPresencePageData } from '@/modules/student-portal/queries/get-student-presence-page';

type StudentPresenceViewProps = {
  data: StudentPresencePageData;
};

const statusClassMap: Record<string, string> = {
  PRESENT: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  ABSENT: 'border-red-500/30 bg-red-500/10 text-red-400',
  LATE: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  EXCUSED: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300',
};

const statusLabelMap: Record<string, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Faltou',
  LATE: 'Atrasado',
  EXCUSED: 'Justificado',
};

export function StudentPresenceView({ data }: StudentPresenceViewProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Frequência
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Minha presença
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-400">
          Acompanhe seu progresso de graduação, heatmap de frequência e histórico
          recente de check-ins.
        </p>
      </section>

      {data.progress ? (
        <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Progresso de graduação
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Faixa {data.progress.currentBeltName}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Meta: {data.progress.minimumAttendances} presenças em{' '}
                {data.progress.minimumMonths} meses
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
              {data.progress.status}
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-zinc-400">
                {data.progress.attendancesSincePromotion} de{' '}
                {data.progress.minimumAttendances} presenças
              </span>
              <span className="font-semibold text-red-400">
                {data.progress.progressPercent}%
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-red-500 transition-all"
                style={{ width: `${data.progress.progressPercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              Previsão de elegibilidade:{' '}
              {data.progress.projectedEligibilityDateLabel}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
              <p className="text-xs text-zinc-500">Presenças desde a faixa</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {data.progress.attendancesSincePromotion}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
              <p className="text-xs text-zinc-500">Faltas desde a faixa</p>
              <p className="mt-1 text-2xl font-bold text-red-400">
                {data.progress.absencesSincePromotion}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <PresenceHeatmap presence={data.presence} showAcademySummary={false} />

      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
        <h2 className="text-lg font-semibold text-white">Histórico recente</h2>
        {data.recentAttendances.length > 0 ? (
          <div className="mt-4 divide-y divide-white/10 rounded-2xl border border-white/10">
            {data.recentAttendances.map((attendance) => (
              <article
                key={attendance.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white">{attendance.className}</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    {attendance.dateLabel} · {attendance.source}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    statusClassMap[attendance.status] ?? statusClassMap.EXCUSED
                  }`}
                >
                  {statusLabelMap[attendance.status] ?? attendance.status}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            Nenhuma presença registrada ainda.
          </p>
        )}
      </section>
    </div>
  );
}
