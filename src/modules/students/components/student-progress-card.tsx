'use client';

import { useTransition } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  TriangleAlert,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import { ProgressStatus } from '@/generated/prisma/client';
import { recalculateStudentProgressAction } from '@/modules/students/actions/recalculate-student-progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type StudentProgressCardProps = {
  studentId: string;
  progress: {
    program: string;
    projectedEligibilityDate: string;
    status: ProgressStatus;
    attendancesSincePromotion: number;
    absencesSincePromotion: number;
    lastAttendanceAt: string;
  } | null;
};

const statusLabelMap: Record<ProgressStatus, string> = {
  ON_TRACK: 'Dentro do prazo',
  ELIGIBLE: 'Elegível',
  POSTPONED: 'Postergado',
};

type ProgressInfoCardProps = {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
};

const ProgressInfoCard = ({
  title,
  value,
  icon: Icon,
}: ProgressInfoCardProps) => {
  return (
    <div className='rounded-xl border border-white/10 bg-zinc-900 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='space-y-1'>
          <p className='text-sm text-zinc-400'>{title}</p>
          <p className='text-sm font-medium text-white'>{value}</p>
        </div>

        <Icon className='h-5 w-5 text-zinc-500' />
      </div>
    </div>
  );
};

export const StudentProgressCard = ({
  studentId,
  progress,
}: StudentProgressCardProps) => {
  const [isPending, startTransition] = useTransition();

  const handleRecalculate = () => {
    startTransition(async () => {
      const result = await recalculateStudentProgressAction({
        studentId,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  };

  return (
    <Card className='border-white/10 bg-zinc-950 text-white'>
      <CardHeader className='flex flex-row items-center justify-between space-y-0'>
        <CardTitle className='text-xl'>Progresso de graduação</CardTitle>

        <Button
          type='button'
          onClick={handleRecalculate}
          disabled={isPending}
          className='bg-red-600 text-white hover:bg-red-500'
        >
          {isPending ? 'Recalculando...' : 'Recalcular'}
        </Button>
      </CardHeader>

      <CardContent>
        {progress ? (
          <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
            <ProgressInfoCard
              title='Programa'
              value={progress.program === 'KIDS' ? 'Kids' : 'Adulto'}
              icon={GraduationCap}
            />

            <ProgressInfoCard
              title='Elegibilidade estimada'
              value={progress.projectedEligibilityDate}
              icon={CalendarClock}
            />

            <ProgressInfoCard
              title='Status'
              value={statusLabelMap[progress.status]}
              icon={CheckCircle2}
            />

            <ProgressInfoCard
              title='Presenças'
              value={progress.attendancesSincePromotion}
              icon={Users}
            />

            <ProgressInfoCard
              title='Faltas'
              value={progress.absencesSincePromotion}
              icon={TriangleAlert}
            />
          </div>
        ) : (
          <div className='rounded-xl border border-white/10 bg-zinc-900 p-4 text-sm text-zinc-400'>
            O progresso ainda não foi calculado para este aluno.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
