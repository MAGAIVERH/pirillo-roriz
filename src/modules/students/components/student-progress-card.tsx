'use client';

import { useTransition } from 'react';
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
            <div className='rounded-xl border border-white/10 bg-zinc-900 p-4'>
              <p className='text-sm text-zinc-400'>Programa</p>
              <p className='mt-1 text-sm text-white'>
                {progress.program === 'KIDS' ? 'Kids' : 'Adulto'}
              </p>
            </div>

            <div className='rounded-xl border border-white/10 bg-zinc-900 p-4'>
              <p className='text-sm text-zinc-400'>Elegibilidade estimada</p>
              <p className='mt-1 text-sm text-white'>
                {progress.projectedEligibilityDate}
              </p>
            </div>

            <div className='rounded-xl border border-white/10 bg-zinc-900 p-4'>
              <p className='text-sm text-zinc-400'>Status</p>
              <p className='mt-1 text-sm text-white'>
                {statusLabelMap[progress.status]}
              </p>
            </div>

            <div className='rounded-xl border border-white/10 bg-zinc-900 p-4'>
              <p className='text-sm text-zinc-400'>Presenças</p>
              <p className='mt-1 text-sm text-white'>
                {progress.attendancesSincePromotion}
              </p>
            </div>

            <div className='rounded-xl border border-white/10 bg-zinc-900 p-4'>
              <p className='text-sm text-zinc-400'>Faltas</p>
              <p className='mt-1 text-sm text-white'>
                {progress.absencesSincePromotion}
              </p>
            </div>
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
