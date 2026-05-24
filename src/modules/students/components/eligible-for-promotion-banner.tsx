import { Trophy } from 'lucide-react';

import { PromoteStudentDialog } from './promote-student-dialog';

type EligibleForPromotionBannerProps = {
  studentId: string;
  studentName: string;
  currentBeltName: string;
  currentDegreeNumber: number | null;
  nextBeltName: string;
  nextDegreeNumber: number | null;
  projectedEligibilityDate: string | null;
  attendancesSincePromotion: number;
  readOnly?: boolean;
};

function formatBeltLabel(belt: string, degree: number | null): string {
  return degree ? `${belt} · ${degree}º grau` : belt;
}

export function EligibleForPromotionBanner({
  studentId,
  studentName,
  currentBeltName,
  currentDegreeNumber,
  nextBeltName,
  nextDegreeNumber,
  projectedEligibilityDate,
  attendancesSincePromotion,
  readOnly = false,
}: EligibleForPromotionBannerProps) {
  const fromLabel = formatBeltLabel(currentBeltName, currentDegreeNumber);
  const toLabel = formatBeltLabel(nextBeltName, nextDegreeNumber);

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <Trophy className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Apto a graduar
          </p>
          <p className="text-lg font-semibold text-white">
            {fromLabel} <span className="text-zinc-500">→</span>{' '}
            <span className="text-emerald-400">{toLabel}</span>
          </p>
          <p className="text-xs text-zinc-400">
            {attendancesSincePromotion} presença(s) desde a última promoção
            {projectedEligibilityDate
              ? ` · elegível desde ${projectedEligibilityDate}`
              : ''}
            .
          </p>
        </div>
      </div>

      {!readOnly ? (
        <PromoteStudentDialog
          studentId={studentId}
          studentName={studentName}
          fromLabel={fromLabel}
          toLabel={toLabel}
        />
      ) : (
        <p className='text-xs text-zinc-400'>
          A graduação é registrada pela equipe administrativa.
        </p>
      )}
    </section>
  );
}
