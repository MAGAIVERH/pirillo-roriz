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
import { UpdateStudentStatusDialog } from '@/modules/students/components/update-student-status-dialog';
import { StudentFinanceCard } from '@/modules/finance/components/student-finance-card';

import { getStudentAttendanceHistory } from '@/modules/students/queries/get-student-attendance-history';
import { getStudentById } from '@/modules/students/queries/get-student-by-id';
import { getStudentEligibility } from '@/modules/students/queries/get-eligible-students';
import { getCancellationReasons } from '@/modules/students/queries/get-cancellation-reasons';
import { getStudentProgressSnapshot } from '@/modules/students/lib/calcule-student-progress';
import { getStudentFinanceSummary } from '@/modules/finance/queries/get-student-finance-summary';

type AdminAlunoDetailsPageProps = {
  params: Promise<{
    alunosId: string;
  }>;
};

export default async function AdminAlunoDetailsPage({
  params,
}: AdminAlunoDetailsPageProps) {
  const { alunosId } = await params;

  const [
    student,
    attendances,
    progressResult,
    finance,
    cancellationReasons,
  ] = await Promise.all([
    getStudentById(alunosId),
    getStudentAttendanceHistory(alunosId),
    getStudentProgressSnapshot(alunosId),
    getStudentFinanceSummary(alunosId),
    getCancellationReasons(),
  ]);

  const eligibility = await getStudentEligibility(alunosId);

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


  return (
    <div className='min-w-0 space-y-6'>
      {/* Cabeçalho */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-4'>
            <AdminBackButton href='/admin/alunos' label='Voltar para alunos' />

            <div className='space-y-2'>
              <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
                Detalhes do aluno
              </p>

              <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                {student.fullName}
              </h1>

              <p className='max-w-3xl text-sm leading-6 wrap-break-word text-zinc-400'>
                Aqui você acompanha os dados do aluno e pode lançar presença
                manual para histórico e migração da base antiga.
              </p>
            </div>
          </div>

          <div className='flex flex-col items-start gap-3 lg:items-end'>
            <StudentStatusBadge status={student.status} />
            <UpdateStudentStatusDialog
              studentId={student.id}
              currentStatus={student.status}
              reasons={cancellationReasons}
            />
          </div>
        </div>
      </section>

      {eligibility && (
        <EligibleForPromotionBanner
          studentId={student.id}
          studentName={student.fullName}
          currentBeltName={eligibility.currentBeltName}
          currentDegreeNumber={eligibility.currentDegreeNumber}
          nextBeltName={eligibility.nextBeltName}
          nextDegreeNumber={eligibility.nextDegreeNumber}
          projectedEligibilityDate={eligibility.projectedEligibilityDate}
          attendancesSincePromotion={eligibility.attendancesSincePromotion}
        />
      )}

      {/* Cards de info principal */}
      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StudentDetailInfoCard title='Email' value={student.email} icon={Mail} />
        <StudentDetailInfoCard
          title='Telefone'
          value={formatStudentPhone(student.phone)}
          icon={Phone}
        />
        <StudentDetailInfoCard
          title='Faixa atual'
          value={student.belt}
          icon={GraduationCap}
        />
        <StudentDetailInfoCard
          title='Idade'
          value={student.age !== null ? `${student.age} anos` : '-'}
          icon={User}
        />
      </section>

      {/* Cards de info secundária */}
      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <StudentDetailInfoCard title='Turma' value={student.className} icon={Users} />
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
          title='Situação atual'
          value={getStudentOperationalStatusLabel(student.status)}
          icon={ShieldCheck}
        />
        <StudentDetailInfoCard
          title='Situação financeira'
          value={getStudentFinancialStatusLabel(student.status)}
          icon={CreditCard}
        />
      </section>

      {/* Card financeiro */}
      <StudentFinanceCard
        studentName={student.fullName}
        billingDueDay={student.billingDueDay}
        finance={finance}
      />

      {/* Progresso de graduação */}
      <StudentProgressCard studentId={student.id} progress={progress} />

      {/* Histórico de presença */}
      <StudentAttendanceHistoryCard
        studentId={student.id}
        baseDateIso={student.baseDateRaw.split('T')[0]}
        baseDateLabel={student.baseDate}
        showBatchControls={student.hasPreviousExperience}
        progressProjectedDateIso={
          progressResult.success &&
          progressResult.progress?.projectedEligibilityDate
            ? progressResult.progress.projectedEligibilityDate.toISOString()
            : null
        }
        attendances={attendances}
      />
    </div>
  );
}
