import { StudentJourneyHeatmap } from '@/modules/students/components/student-journey-heatmap';
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
  const progress = data.progress;

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
          Acompanhe seu progresso de graduação e a jornada visual de presenças
          desde a sua faixa atual.
        </p>
      </section>

      {progress ? (
        <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Progresso de graduação
              </p>
              <h2 className="mt-1 text-xl font-bold text-white">
                Faixa {progress.currentBeltName}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {progress.minimumAttendances > 0
                  ? `Meta: ${progress.minimumAttendances} presenças em ${progress.minimumMonthsLabel}`
                  : `Meta: tempo mínimo de ${progress.minimumMonthsLabel}`}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
              {progress.status}
            </span>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-xs text-zinc-400">Data base</span>
              <span className="rounded-full border border-white/10 bg-zinc-950 px-3 py-1 text-xs font-medium text-zinc-200">
                {progress.progressPercent}% da jornada
              </span>
              <span className="text-xs text-zinc-400 sm:text-right">
                Próxima graduação
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-950 text-sm sm:h-9 sm:w-9">
                🥋
              </div>

              <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-800 sm:h-3">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress.progressPercent}%` }}
                />
              </div>

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-950 text-sm sm:h-9 sm:w-9">
                🏆
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400">
              <span className="truncate">{progress.baseDateLabel}</span>
              <span className="truncate text-right">
                {progress.projectedEligibilityDateLabel}
              </span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                  Tempo percorrido
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {progress.elapsedProgressDays} de {progress.totalProgressDays}{' '}
                  dias ({progress.timePercent}%)
                </p>
              </div>

              {progress.minimumAttendances > 0 ? (
                <div className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Presenças
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {progress.attendancesSincePromotion} de{' '}
                    {progress.minimumAttendances} ({progress.attendancePercent}
                    %)
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2">
                  <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                    Presenças desde a faixa
                  </p>
                  <p className="mt-1 text-sm font-semibold text-emerald-400">
                    {progress.attendancesSincePromotion}
                  </p>
                </div>
              )}
            </div>

            <p className="mt-3 text-xs leading-5 text-zinc-400">
              {progress.elapsedProgressDays} dias percorridos desde a data base
              · {progress.remainingDays} dias restantes estimados
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
              <p className="text-xs text-zinc-500">Presenças desde a faixa</p>
              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {progress.attendancesSincePromotion}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4">
              <p className="text-xs text-zinc-500">Faltas desde a faixa</p>
              <p className="mt-1 text-2xl font-bold text-red-400">
                {progress.absencesSincePromotion}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-5 sm:p-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white">Consistência de treino</p>
          <p className="text-xs text-zinc-400">
            Jornada visual desde a data base até hoje, com presenças, faltas,
            atrasos e justificativas.
          </p>
        </div>

        <div className="mt-4">
          <StudentJourneyHeatmap weeks={data.heatmapWeeks} />
        </div>
      </section>

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
