import { notFound } from 'next/navigation';
import {
  CalendarClock,
  GraduationCap,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

import { AdminBackButton } from '@/components/layout/admin-back-button';
import { Card, CardContent } from '@/components/ui/card';
import { requireInstructorContext } from '@/lib/session-context';
import { verifyInstructorStudentAccess } from '@/modules/instructor-portal/queries/verify-instructor-student-access';
import { EligibleForPromotionBanner } from '@/modules/students/components/eligible-for-promotion-banner';
import { StudentAttendanceHistoryCard } from '@/modules/students/components/student-attendance-history-card';
import { StudentProgressCard } from '@/modules/students/components/student-progress-card';
import { StudentStatusBadge } from '@/modules/students/components/student-status-badge';
import { calculateStudentProgress } from '@/modules/students/lib/calcule-student-progress';
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

type DetailInfoCardProps = {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
};

const DetailInfoCard = ({ title, value, icon: Icon }: DetailInfoCardProps) => {
  return (
    <Card className="border-white/10 bg-zinc-950 text-white">
      <CardContent className="flex items-start justify-between gap-4 px-5 py-3">
        <div className="min-w-0 space-y-2">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="wrap-break-word text-sm text-zinc-300">{value}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600/15 text-red-400">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
};

const getOperationalStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    LEAD: 'Interessado',
    TRIAL: 'Experimental',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    FROZEN: 'Trancado',
    CANCELED: 'Cancelado',
    DELINQUENT: 'Inadimplente',
  };

  return map[status] ?? status;
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
    calculateStudentProgress(studentId),
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

  const backHref = turma ? `/professor/turmas/${turma}` : '/professor/turmas';
  const backLabel = turma ? 'Voltar para turma' : 'Voltar para turmas';

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <AdminBackButton href={backHref} label={backLabel} />

            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
                Aluno
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {student.fullName}
              </h1>

              <p className="max-w-3xl text-sm leading-6 text-zinc-400">
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
        <DetailInfoCard title="Faixa atual" value={student.belt} icon={GraduationCap} />
        <DetailInfoCard title="Turma" value={student.className} icon={Users} />
        <DetailInfoCard
          title={
            student.baseType === 'LAST_GRADUATION'
              ? 'Última graduação'
              : 'Data de início'
          }
          value={student.baseDate}
          icon={CalendarClock}
        />
        <DetailInfoCard
          title="Situação"
          value={getOperationalStatusLabel(student.status)}
          icon={ShieldCheck}
        />
        <DetailInfoCard
          title="Idade"
          value={student.age !== null ? `${student.age} anos` : '-'}
          icon={User}
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
