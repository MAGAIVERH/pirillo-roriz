'use client';

import { useMemo, useState, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

import { AttendanceStatus } from '@/generated/prisma/client';
import { createStudentManualAttendanceAction } from '@/modules/students/actions/create-student-manual-attendance';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

type StudentAttendanceHistoryCardProps = {
  studentId: string;
  attendances: {
    id: string;
    date: string;
    dateLabel: string;
    status: string;
    source: string;
    notes: string;
  }[];
};

const statusLabelMap: Record<string, string> = {
  PRESENT: 'Presente',
  ABSENT: 'Faltou',
  LATE: 'Atrasado',
  EXCUSED: 'Justificado',
};

const sourceLabelMap: Record<string, string> = {
  MANUAL: 'Manual',
  QR_CODE: 'QR Code',
  ADMIN_ADJUSTMENT: 'Ajuste manual',
};

const formatDateToInput = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

export const StudentAttendanceHistoryCard = ({
  studentId,
  attendances,
}: StudentAttendanceHistoryCardProps) => {
  const [attendanceDate, setAttendanceDate] = useState<Date | undefined>();
  const [status, setStatus] = useState<AttendanceStatus | ''>('');
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const formattedAttendanceDate = useMemo(() => {
    if (!attendanceDate) {
      return '';
    }

    return formatDateToInput(attendanceDate);
  }, [attendanceDate]);

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createStudentManualAttendanceAction({
        studentId,
        attendanceDate: formattedAttendanceDate,
        status: status as AttendanceStatus,
        notes,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setAttendanceDate(undefined);
      setStatus('');
      setNotes('');
    });
  };

  return (
    <Card className='border-white/10 bg-zinc-950 text-white'>
      <CardHeader>
        <CardTitle className='text-xl'>Histórico de presença</CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='grid gap-4 lg:grid-cols-3'>
          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Data</p>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  className={cn(
                    'w-full justify-start border-white/10 bg-zinc-900 text-left font-normal text-white hover:bg-zinc-800 hover:text-white',
                    !attendanceDate && 'text-zinc-500',
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {attendanceDate
                    ? format(attendanceDate, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })
                    : 'Selecione a data'}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className='w-auto border-white/10 bg-zinc-950 p-0 text-white'
                align='start'
              >
                <Calendar
                  mode='single'
                  selected={attendanceDate}
                  onSelect={setAttendanceDate}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Status</p>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as AttendanceStatus)}
            >
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione o status' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='PRESENT'>Presente</SelectItem>
                <SelectItem value='ABSENT'>Faltou</SelectItem>
                <SelectItem value='LATE'>Atrasado</SelectItem>
                <SelectItem value='EXCUSED'>Justificado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-end'>
            <Button
              type='button'
              onClick={handleSubmit}
              disabled={isPending}
              className='w-full bg-red-600 text-white hover:bg-red-500'
            >
              {isPending ? 'Salvando...' : 'Adicionar presença'}
            </Button>
          </div>
        </div>

        <div className='space-y-2'>
          <p className='text-sm text-zinc-400'>Observações</p>
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder='Observação opcional sobre esse lançamento'
            className='min-h-24 border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
          />
        </div>

        <div className='space-y-3'>
          {attendances.length > 0 ? (
            attendances.map((item) => (
              <div
                key={item.id}
                className='rounded-xl border border-white/10 bg-zinc-900 p-4'
              >
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='space-y-1'>
                    <p className='font-medium text-white'>{item.dateLabel}</p>
                    <p className='text-sm text-zinc-400'>
                      {statusLabelMap[item.status] ?? item.status} •{' '}
                      {sourceLabelMap[item.source] ?? item.source}
                    </p>
                  </div>

                  <span className='text-sm text-zinc-400'>{item.notes}</span>
                </div>
              </div>
            ))
          ) : (
            <div className='rounded-xl border border-white/10 bg-zinc-900 p-4 text-sm text-zinc-400'>
              Nenhuma presença lançada ainda para este aluno.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
