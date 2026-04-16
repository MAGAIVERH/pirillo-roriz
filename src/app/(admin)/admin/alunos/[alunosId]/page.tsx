import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StudentAttendanceHistoryCard } from '@/modules/students/components/student-attendance-history-card';
import { StudentProgressCard } from '@/modules/students/components/student-progress-card';
import { StudentStatusBadge } from '@/modules/students/components/student-status-badge';

import { getStudentAttendanceHistory } from '@/modules/students/queries/get-student-attendance-history';
import { getStudentById } from '@/modules/students/queries/get-student-by-id';
import { calculateStudentProgress } from '@/modules/students/lib/calcule-student-progress';

type AdminAlunoDetailsPageProps = {
  params: Promise<{
    alunosId: string;
  }>;
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

const getFinancialStatusLabel = (status: string) => {
  if (status === 'DELINQUENT') {
    return 'Inadimplente';
  }

  return 'Sem pendência';
};

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
      7,
      11,
    )}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(
      6,
      10,
    )}`;
  }

  return value;
};

type DetailInfoCardProps = {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
};

const DetailInfoCard = ({ title, value, icon: Icon }: DetailInfoCardProps) => {
  return (
    <Card className='border-white/10 bg-zinc-950 text-white'>
      <CardContent className='flex items-start justify-between gap-4 px-5 py-3'>
        <div className='min-w-0 space-y-2'>
          <p className='text-base font-semibold text-white'>{title}</p>
          <p className='wrap-break-word text-sm text-zinc-300'>{value}</p>
        </div>

        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600/15 text-red-400'>
          <Icon className='h-5 w-5' />
        </div>
      </CardContent>
    </Card>
  );
};

export default async function AdminAlunoDetailsPage({
  params,
}: AdminAlunoDetailsPageProps) {
  const { alunosId } = await params;

  const [student, attendances, progressResult] = await Promise.all([
    getStudentById(alunosId),
    getStudentAttendanceHistory(alunosId),
    calculateStudentProgress(alunosId),
  ]);

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
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-3'>
            <Button
              asChild
              variant='outline'
              className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
            >
              <Link href='/admin/alunos'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Voltar para alunos
              </Link>
            </Button>

            <div className='space-y-2'>
              <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
                Detalhes do aluno
              </p>

              <h1 className='text-3xl font-bold tracking-tight'>
                {student.fullName}
              </h1>

              <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
                Aqui você acompanha os dados do aluno e pode lançar presença
                manual para histórico e migração da base antiga.
              </p>
            </div>
          </div>

          <StudentStatusBadge status={student.status} />
        </div>
      </section>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <DetailInfoCard title='Email' value={student.email} icon={Mail} />
        <DetailInfoCard
          title='Telefone'
          value={formatPhone(student.phone)}
          icon={Phone}
        />
        <DetailInfoCard
          title='Faixa atual'
          value={student.belt}
          icon={GraduationCap}
        />
        <DetailInfoCard
          title='Idade'
          value={student.age !== null ? `${student.age} anos` : '-'}
          icon={User}
        />
      </section>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <DetailInfoCard title='Turma' value={student.className} icon={Users} />
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
          title='Situação atual'
          value={getOperationalStatusLabel(student.status)}
          icon={ShieldCheck}
        />
        <DetailInfoCard
          title='Situação financeira'
          value={getFinancialStatusLabel(student.status)}
          icon={CreditCard}
        />
      </section>

      <StudentProgressCard studentId={student.id} progress={progress} />

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
