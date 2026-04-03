import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StudentAttendanceHistoryCard } from '@/modules/students/components/student-attendance-history-card';
import { StudentProgressCard } from '@/modules/students/components/student-progress-card';
import { StudentStatusBadge } from '@/modules/students/components/student-status-badge';

import { getStudentAttendanceHistory } from '@/modules/students/queries/get-student-attendance-history';
import { getStudentById } from '@/modules/students/queries/get-student-by-id';
import { calculateStudentProgress } from '@/modules/students/lib/calcule-student-progress';

type AdminAlunoDetailsPageProps = {
  params: Promise<{
    studentId: string;
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

  return 'Sem pendência identificada';
};

export default async function AdminAlunoDetailsPage({
  params,
}: AdminAlunoDetailsPageProps) {
  const { studentId } = await params;

  const [student, attendances, progressResult] = await Promise.all([
    getStudentById(studentId),
    getStudentAttendanceHistory(studentId),
    calculateStudentProgress(studentId),
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
        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{student.email}</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Telefone</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{student.phone}</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Faixa atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{student.belt}</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Idade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>
              {student.age !== null ? `${student.age} anos` : '-'}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{student.className}</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Data de entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{student.joinDate}</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Situação atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>
              {getOperationalStatusLabel(student.status)}
            </p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Situação financeira</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>
              {getFinancialStatusLabel(student.status)}
            </p>
          </CardContent>
        </Card>
      </section>

      <StudentProgressCard studentId={student.id} progress={progress} />

      <StudentAttendanceHistoryCard
        studentId={student.id}
        attendances={attendances}
      />
    </div>
  );
}
