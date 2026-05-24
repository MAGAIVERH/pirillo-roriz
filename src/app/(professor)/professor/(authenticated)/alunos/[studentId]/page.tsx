import { notFound } from 'next/navigation';
import {
  CalendarClock,
  CreditCard,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

import { AdminBackButton } from '@/components/layout/admin-back-button';
import { requireInstructorContext } from '@/lib/session-context';
import { verifyInstructorStudentAccess } from '@/modules/instructor-portal/queries/verify-instructor-student-access';
import { EligibleForPromotionBanner } from '@/modules/students/components/eligible-for-promotion-banner';
import {
  formatStudentPhone,
  getStudentFinancialStatusLabel,
  getStudentOperationalStatusLabel,
  StudentDetailInfoCard,
} from '@/modules/students/components/student-detail-info-card';
import { StudentAttendanceHistoryCard } from '@/modules/students/components/student-attendance-history-card';
import { StudentProgressCard } from '@/modules/students/components/student-progress-card';
import { StudentStatusBadge } from '@/modules/students/components/student-status-badge';
import { getStudentProgressSnapshot } from '@/modules/students/lib/calcule-student-progress';
import { getStudentAttendanceHistory } from '@/modules/students/queries/get-student-attendance-history';
import { getStudentById } from '@/modules/students/queries/get-student-by-id';
import { getStudentEligibility } from '@/modules/students/queries/get-eligible-students';

type ProfessorStudentDetailPageProps = {
  params: Promise<{
    studentId: string;
  }>;
  searchParams: Promise<{
    turma?: string;
  }>;
};

export default async function ProfessorStudentDetailPage({
  params,
  searchParams,
}: ProfessorStudentDetailPageProps) {
  const { instructor } = await requireInstructorContext();
  const { studentId } = await params;
  const { turma } = await searchParams;

  const hasAccess = await verifyInstructorStudentAccess(
    instructor.id,
    studentId,
  );

  if (!hasAccess) {
    notFound();
  }

  const [student, attendances, progressResult] = await Promise.all([
    getStudentById(studentId),
    getStudentAttendanceHistory(studentId),
    getStudentProgressSnapshot(studentId),
  ]);

  const eligibility = await getStudentEligibility(studentId);
  const isDelinquent = student.status === 'DELINQUENT';

  const progress =
    progressResult.success && progressResult.progress
      ? {
          program: progressResult.progress.program,
          projectedEligibilityDate:
            progressResult.progress.projectedEligibilityDate?.toLocaleDateString(
              'pt-BR',
            ) ?? '-',
          status: progressResult.progress.status,
          attendancesSincePromotion:
            progressResult.progress.attendancesSincePromotion,
          absencesSincePromotion:
            progressResult.progress.absencesSincePromotion,
          lastAttendanceAt:
            progressResult.progress.lastAttendanceAt?.toLocaleDateString(
              'pt-BR',
            ) ?? '-',
        }
      : null;

  const backHref = turma ? `/professor/turmas/${turma}` : '/professor/alunos';
  const backLabel = turma ? 'Voltar para turma' : 'Voltar para alunos';

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <AdminBackButton href={backHref} label={backLabel} />

            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
                Detalhes do aluno
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {student.fullName}
              </h1>

              <p className="max-w-3xl text-sm leading-6 wrap-break-word text-zinc-400">
                Acompanhe a frequência, progresso de graduação e lance
                presenças manualmente.
              </p>
            </div>
          </div>

          <StudentStatusBadge status={student.status} />
        </div>
      </section>

      {eligibility ? (
        <EligibleForPromotionBanner
          studentId={student.id}
          studentName={student.fullName}
          currentBeltName={eligibility.currentBeltName}
          currentDegreeNumber={eligibility.currentDegreeNumber}
          nextBeltName={eligibility.nextBeltName}
          nextDegreeNumber={eligibility.nextDegreeNumber}
          projectedEligibilityDate={eligibility.projectedEligibilityDate}
          attendancesSincePromotion={eligibility.attendancesSincePromotion}
          readOnly
        />
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StudentDetailInfoCard title="Email" value={student.email} icon={Mail} />
        <StudentDetailInfoCard
          title="Telefone"
          value={formatStudentPhone(student.phone)}
          icon={Phone}
        />
        <StudentDetailInfoCard
          title="Faixa atual"
          value={student.belt}
          icon={GraduationCap}
        />
        <StudentDetailInfoCard
          title="Idade"
          value={student.age !== null ? `${student.age} anos` : '-'}
          icon={User}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StudentDetailInfoCard
          title="Turma"
          value={student.className}
          icon={Users}
        />
        <StudentDetailInfoCard
          title={
            student.baseType === 'LAST_GRADUATION'
              ? 'Última graduação'
              : 'Data de início'
          }
          value={student.baseDate}
          icon={CalendarClock}
        />
        <StudentDetailInfoCard
          title="Situação atual"
          value={getStudentOperationalStatusLabel(student.status)}
          icon={ShieldCheck}
        />
        <StudentDetailInfoCard
          title="Situação financeira"
          value={getStudentFinancialStatusLabel(student.status)}
          icon={CreditCard}
        />
      </section>

      <StudentProgressCard
        studentId={student.id}
        progress={progress}
        showRecalculateButton={false}
      />

      <StudentAttendanceHistoryCard
        studentId={student.id}
        baseDateIso={student.baseDateRaw.split('T')[0]}
        baseDateLabel={student.baseDate}
        showBatchControls={false}
        progressProjectedDateIso={
          progressResult.success &&
          progressResult.progress?.projectedEligibilityDate
            ? progressResult.progress.projectedEligibilityDate.toISOString()
            : null
        }
        allowMarking={!isDelinquent}
        allowDelete={false}
        attendanceMode="instructor"
        isDelinquent={isDelinquent}
        attendances={attendances}
      />
    </div>
  );
}
