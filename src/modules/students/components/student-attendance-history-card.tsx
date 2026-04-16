'use client';

import { useMemo, useState, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Trash2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import { deleteStudentManualAttendanceAction } from '@/modules/students/actions/delete-student-manual-attendance';
import { createStudentManualAttendanceAction } from '@/modules/students/actions/create-student-manual-attendance';
import { upsertStudentAttendanceBulkAction } from '../actions/upsert-student.attendance-bulk';

import { Button } from '@/components/ui/button';
import { Calendar, CalendarDayButton } from '@/components/ui/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type AttendanceStatusValue = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

type StudentAttendanceHistoryCardProps = {
  studentId: string;
  baseDateIso: string | null;
  baseDateLabel: string | null;
  showBatchControls: boolean;
  progressProjectedDateIso: string | null;
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

const statusButtonMap: {
  label: string;
  value: AttendanceStatusValue;
  className: string;
}[] = [
  {
    label: 'Presente',
    value: 'PRESENT',
    className:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
  },
  {
    label: 'Faltou',
    value: 'ABSENT',
    className:
      'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20',
  },
  {
    label: 'Atrasado',
    value: 'LATE',
    className:
      'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20',
  },
  {
    label: 'Justificado',
    value: 'EXCUSED',
    className:
      'border-sky-500/20 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20',
  },
];

const toLocalDateKey = (date: Date) => format(date, 'yyyy-MM-dd');

const getStatusHeatmapClassName = (status?: string) => {
  if (status === 'PRESENT') {
    return 'bg-emerald-500/70';
  }

  if (status === 'ABSENT') {
    return 'bg-red-500/70';
  }

  if (status === 'LATE') {
    return 'bg-amber-500/70';
  }

  if (status === 'EXCUSED') {
    return 'bg-sky-500/70';
  }

  return 'bg-zinc-800';
};

export const StudentAttendanceHistoryCard = ({
  studentId,
  baseDateIso,
  baseDateLabel,
  showBatchControls,
  progressProjectedDateIso,
  attendances,
}: StudentAttendanceHistoryCardProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, startSaving] = useTransition();
  const [isDeleting, startDeleting] = useTransition();

  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toLocalDateKey(today), [today]);

  const minDate = useMemo(
    () => (baseDateIso ? new Date(`${baseDateIso}T00:00:00`) : undefined),
    [baseDateIso],
  );

  const projectedDate = useMemo(
    () =>
      progressProjectedDateIso ? new Date(progressProjectedDateIso) : null,
    [progressProjectedDateIso],
  );

  const projectedDateLabel = projectedDate
    ? format(projectedDate, 'dd/MM/yyyy')
    : '-';

  const totalProgressDays =
    minDate && projectedDate
      ? Math.max(
          1,
          Math.ceil(
            (projectedDate.getTime() - minDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const elapsedProgressDays =
    minDate && projectedDate
      ? Math.min(
          totalProgressDays,
          Math.max(
            0,
            Math.ceil(
              (today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24),
            ),
          ),
        )
      : 0;

  const progressPercentage =
    totalProgressDays > 0
      ? Math.min(
          100,
          Math.round((elapsedProgressDays / totalProgressDays) * 100),
        )
      : 0;

  const remainingDays =
    minDate && projectedDate
      ? Math.max(
          0,
          Math.ceil(
            (projectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          ),
        )
      : 0;

  const totalPresent = attendances.filter(
    (item) => item.status === 'PRESENT',
  ).length;

  const totalAbsent = attendances.filter(
    (item) => item.status === 'ABSENT',
  ).length;

  const totalLate = attendances.filter((item) => item.status === 'LATE').length;

  const totalExcused = attendances.filter(
    (item) => item.status === 'EXCUSED',
  ).length;

  const attendanceMap = useMemo(() => {
    return new Map(attendances.map((item) => [item.date, item]));
  }, [attendances]);

  const attendanceNotesMap = useMemo(() => {
    return new Map(
      attendances
        .filter((item) => item.notes && item.notes !== '-')
        .map((item) => [item.date, item.notes]),
    );
  }, [attendances]);

  const heatmapDays = useMemo(() => {
    const start = minDate ? new Date(minDate) : new Date(today);
    start.setHours(12, 0, 0, 0);

    if (!minDate) {
      start.setDate(start.getDate() - 119);
    }

    start.setDate(start.getDate() - start.getDay());

    const end = new Date(today);
    end.setHours(12, 0, 0, 0);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const days: {
      dateKey: string;
      dayLabel: string;
      status?: string;
    }[] = [];

    const cursor = new Date(start);

    while (cursor <= end) {
      const dateKey = toLocalDateKey(cursor);
      const attendance = attendanceMap.get(dateKey);

      days.push({
        dateKey,
        dayLabel: format(cursor, 'dd/MM'),
        status: attendance?.status,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }, [attendanceMap, minDate, today]);

  const selectedDateKeys = useMemo(() => {
    return selectedDates.map((date) => toLocalDateKey(date));
  }, [selectedDates]);

  const selectedDateSet = useMemo(() => {
    return new Set(selectedDateKeys);
  }, [selectedDateKeys]);

  const isSingleSelection = selectedDates.length === 1;
  const selectedDate = isSingleSelection ? selectedDates[0] : undefined;
  const selectedAttendance =
    selectedDate && selectedDateKeys[0]
      ? attendanceMap.get(selectedDateKeys[0])
      : undefined;

  const canEditNotes = selectedDates.length === 1;

  const handleSelectedDatesChange = (dates: Date[] | undefined) => {
    const nextDates = dates ?? [];
    setSelectedDates(nextDates);

    if (nextDates.length !== 1) {
      setNotes('');
      return;
    }

    const nextKey = toLocalDateKey(nextDates[0]);
    const nextAttendance = attendanceMap.get(nextKey);

    setNotes(
      nextAttendance?.notes && nextAttendance.notes !== '-'
        ? nextAttendance.notes
        : '',
    );
  };

  const presentDates = attendances
    .filter(
      (item) =>
        item.status === 'PRESENT' &&
        !selectedDateSet.has(item.date) &&
        item.date <= todayKey,
    )
    .map((item) => new Date(`${item.date}T12:00:00`));

  const absentDates = attendances
    .filter(
      (item) =>
        item.status === 'ABSENT' &&
        !selectedDateSet.has(item.date) &&
        item.date <= todayKey,
    )
    .map((item) => new Date(`${item.date}T12:00:00`));

  const lateDates = attendances
    .filter(
      (item) =>
        item.status === 'LATE' &&
        !selectedDateSet.has(item.date) &&
        item.date <= todayKey,
    )
    .map((item) => new Date(`${item.date}T12:00:00`));

  const excusedDates = attendances
    .filter(
      (item) =>
        item.status === 'EXCUSED' &&
        !selectedDateSet.has(item.date) &&
        item.date <= todayKey,
    )
    .map((item) => new Date(`${item.date}T12:00:00`));

  const handleSave = (status: AttendanceStatusValue) => {
    if (selectedDates.length === 0) {
      toast.error('Selecione pelo menos uma data no calendário.');
      return;
    }

    startSaving(async () => {
      if (selectedDates.length === 1 && selectedDate) {
        const result = await createStudentManualAttendanceAction({
          studentId,
          attendanceDate: toLocalDateKey(selectedDate),
          status,
          notes,
        });

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        setNotes('');
        setSelectedDates([]);
        return;
      }

      const result = await upsertStudentAttendanceBulkAction({
        studentId,
        dates: selectedDateKeys,
        status,
        notes,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setNotes('');
      setSelectedDates([]);
    });
  };

  const handleDelete = () => {
    if (!selectedAttendance) {
      toast.error('Selecione um único dia com lançamento para remover.');
      return;
    }

    startDeleting(async () => {
      const result = await deleteStudentManualAttendanceAction({
        studentId,
        attendanceId: selectedAttendance.id,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setNotes('');
      setSelectedDates([]);
    });
  };

  const AttendanceCalendarDayButton = (
    props: React.ComponentProps<typeof CalendarDayButton>,
  ) => {
    const dayKey = toLocalDateKey(props.day.date);
    const note = attendanceNotesMap.get(dayKey);

    if (!note) {
      return <CalendarDayButton {...props} />;
    }

    return (
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className='relative'>
              <CalendarDayButton {...props} />
              <span className='pointer-events-none absolute right-1 top-1 z-20 text-amber-300'>
                <TriangleAlert className='h-3 w-3' />
              </span>
            </div>
          </TooltipTrigger>

          <TooltipContent className='max-w-60 border-white/10 bg-zinc-950 text-white'>
            <p className='text-xs leading-5'>{note}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className='border-white/10 bg-zinc-950 text-white'>
      <CardHeader>
        <CardTitle className='text-xl'>Calendário de presença</CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        {showBatchControls ? (
          <div className='w-full rounded-2xl border border-white/10 bg-zinc-900 p-4'>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-950 text-zinc-400'>
                  <CalendarIcon className='h-4 w-4' />
                </div>

                <div className='min-w-0 space-y-1'>
                  <p className='text-sm font-medium leading-6 text-white'>
                    {selectedDates.length === 0
                      ? 'Selecione as datas retroativas do atleta para contabilizar a frequência na próxima graduação.'
                      : selectedDates.length === 1 && selectedDate
                      ? `1 data selecionada: ${format(
                          selectedDate,
                          'dd/MM/yyyy',
                        )}`
                      : `${selectedDates.length} datas selecionadas para aplicação em lote.`}
                  </p>

                  <p className='text-xs text-zinc-400'>
                    Use este bloco para controlar os lançamentos retroativos do
                    aluno.
                  </p>
                </div>
              </div>

              <div className='flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2'>
                <p className='text-xs font-medium uppercase tracking-wide text-zinc-400'>
                  Status atual
                </p>

                <Badge
                  variant='outline'
                  className='border-white/10 bg-zinc-900 text-zinc-200'
                >
                  {selectedDates.length > 1
                    ? 'Aplicação em lote'
                    : selectedAttendance
                    ? statusLabelMap[selectedAttendance.status] ??
                      selectedAttendance.status
                    : 'Sem lançamento'}
                </Badge>
              </div>
            </div>
          </div>
        ) : null}

        <div className='grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]'>
          <div className='rounded-2xl border border-white/10 bg-zinc-900 p-4'>
            <Calendar
              mode='multiple'
              selected={selectedDates}
              onSelect={handleSelectedDatesChange}
              locale={ptBR}
              disabled={[
                { after: today },
                ...(minDate ? [{ before: minDate }] : []),
              ]}
              className='w-full rounded-md bg-zinc-900 text-white'
              modifiers={{
                present: presentDates,
                absent: absentDates,
                late: lateDates,
                excused: excusedDates,
              }}
              modifiersClassNames={{
                present:
                  'bg-emerald-500/20 text-emerald-300 font-semibold hover:bg-emerald-500/30',
                absent:
                  'bg-red-500/20 text-red-300 font-semibold hover:bg-red-500/30',
                late: 'bg-amber-500/20 text-amber-300 font-semibold hover:bg-amber-500/30',
                excused:
                  'bg-sky-500/20 text-sky-300 font-semibold hover:bg-sky-500/30',
              }}
              components={{
                DayButton: AttendanceCalendarDayButton,
              }}
            />

            <div className='mt-4 rounded-xl border border-dashed border-white/10 bg-zinc-950/60 p-3 text-sm text-zinc-400'>
              {selectedDates.length === 0
                ? 'Nenhuma data selecionada.'
                : selectedDates.length === 1
                ? `1 data selecionada: ${format(
                    selectedDates[0],
                    'dd/MM/yyyy',
                  )}`
                : `${selectedDates.length} datas selecionadas para aplicação em lote.`}
            </div>

            <div className='mt-3 rounded-xl border border-white/10 bg-zinc-950/60 p-3 text-xs text-zinc-400'>
              {baseDateLabel
                ? `Lançamentos permitidos de ${baseDateLabel} até hoje.`
                : 'Lançamentos permitidos até hoje.'}
            </div>

            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              {statusButtonMap.map((item) => (
                <Button
                  key={item.value}
                  type='button'
                  variant='outline'
                  disabled={
                    isSaving || isDeleting || selectedDates.length === 0
                  }
                  onClick={() => handleSave(item.value)}
                  className={cn('border transition', item.className)}
                >
                  {isSaving ? 'Salvando...' : item.label}
                </Button>
              ))}
            </div>

            <div className='mt-3'>
              <Button
                type='button'
                variant='outline'
                disabled={
                  isSaving ||
                  isDeleting ||
                  !selectedAttendance ||
                  selectedDates.length !== 1
                }
                onClick={handleDelete}
                className='w-full border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                {isDeleting ? 'Removendo...' : 'Remover lançamento'}
              </Button>
            </div>

            <div className='mt-4'>
              <p className='mb-2 text-sm text-zinc-400'>Observações</p>

              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                disabled={!canEditNotes}
                placeholder={
                  !canEditNotes
                    ? 'Selecione apenas 1 dia para adicionar observação'
                    : 'Observação opcional para este dia'
                }
                className='min-h-28 border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-60'
              />
              <p className='mt-2 text-xs text-zinc-500'>
                {canEditNotes
                  ? 'A observação será vinculada somente ao dia selecionado.'
                  : 'Para evitar confusão, observações só podem ser lançadas com 1 dia selecionado.'}
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='rounded-2xl border border-white/10 bg-zinc-900 p-4'>
              <div className='space-y-2'>
                <p className='text-sm font-medium text-white'>
                  Consistência de treino
                </p>
                <p className='text-xs text-zinc-400'>
                  Jornada visual do aluno até a próxima graduação.
                </p>
              </div>

              <div className='mt-4 rounded-xl border border-white/10 bg-zinc-950 p-4'>
                <div className='flex items-center justify-between gap-3 text-xs text-zinc-400'>
                  <span>Data base</span>
                  <Badge
                    variant='outline'
                    className='border-white/10 bg-zinc-900 text-zinc-200'
                  >
                    {progressPercentage}% da jornada
                  </Badge>
                  <span>Próxima graduação</span>
                </div>

                <div className='mt-3 flex items-center gap-3'>
                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-sm'>
                    🥋
                  </div>

                  <div className='h-3 flex-1 overflow-hidden rounded-full bg-zinc-800'>
                    <div
                      className='h-full rounded-full bg-emerald-500 transition-all'
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-sm'>
                    🏆
                  </div>
                </div>

                <div className='mt-3 flex items-center justify-between text-xs text-zinc-400'>
                  <span>{baseDateLabel ?? 'Data base'}</span>
                  <span>{projectedDateLabel}</span>
                </div>

                <div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
                  <div className='rounded-xl border border-white/10 bg-zinc-900 px-3 py-2'>
                    <p className='text-[11px] uppercase tracking-wide text-zinc-500'>
                      Presenças
                    </p>
                    <p className='mt-1 text-sm font-semibold text-white'>
                      {totalPresent}
                    </p>
                  </div>

                  <div className='rounded-xl border border-white/10 bg-zinc-900 px-3 py-2'>
                    <p className='text-[11px] uppercase tracking-wide text-zinc-500'>
                      Faltas
                    </p>
                    <p className='mt-1 text-sm font-semibold text-white'>
                      {totalAbsent}
                    </p>
                  </div>

                  <div className='rounded-xl border border-white/10 bg-zinc-900 px-3 py-2'>
                    <p className='text-[11px] uppercase tracking-wide text-zinc-500'>
                      Atrasos
                    </p>
                    <p className='mt-1 text-sm font-semibold text-white'>
                      {totalLate}
                    </p>
                  </div>

                  <div className='rounded-xl border border-white/10 bg-zinc-900 px-3 py-2'>
                    <p className='text-[11px] uppercase tracking-wide text-zinc-500'>
                      Justificados
                    </p>
                    <p className='mt-1 text-sm font-semibold text-white'>
                      {totalExcused}
                    </p>
                  </div>
                </div>

                <div className='mt-3 text-xs text-zinc-400'>
                  {elapsedProgressDays} dias percorridos desde a data base •{' '}
                  {remainingDays} dias restantes estimados
                </div>
              </div>

              <div className='mt-4 rounded-xl border border-white/10 bg-zinc-950 p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='text-xs font-medium uppercase tracking-wide text-zinc-400'>
                    Heatmap da jornada
                  </p>

                  <div className='flex items-center gap-2 text-[11px] text-zinc-500'>
                    <span>Legenda</span>
                    <span className='h-3 w-3 rounded-[3px] bg-emerald-500/70' />
                    <span className='h-3 w-3 rounded-[3px] bg-red-500/70' />
                    <span className='h-3 w-3 rounded-[3px] bg-amber-500/70' />
                    <span className='h-3 w-3 rounded-[3px] bg-sky-500/70' />
                  </div>
                </div>

                <div className='mt-4 flex gap-3'>
                  <div className='shrink-0 rounded-md bg-zinc-950/80 pr-2 text-[11px] text-zinc-500'>
                    <div className='mb-5.5 h-4' />
                    <div className='flex flex-col gap-2'>
                      <span className='h-4'>D</span>
                      <span className='h-4'>S</span>
                      <span className='h-4'>T</span>
                      <span className='h-4'>Q</span>
                      <span className='h-4'>Q</span>
                      <span className='h-4'>S</span>
                      <span className='h-4'>S</span>
                    </div>
                  </div>

                  <div className='overflow-x-auto pb-2 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                    <div className='min-w-max'>
                      <div className='mb-2 grid grid-flow-col auto-cols-[16px] gap-2 text-[11px] text-zinc-500'>
                        {Array.from({
                          length: Math.ceil(heatmapDays.length / 7),
                        }).map((_, columnIndex) => {
                          const firstDay = heatmapDays[columnIndex * 7];
                          const previousFirstDay =
                            columnIndex > 0
                              ? heatmapDays[(columnIndex - 1) * 7]
                              : null;

                          const currentMonth = firstDay?.dateKey.slice(5, 7);
                          const previousMonth = previousFirstDay?.dateKey.slice(
                            5,
                            7,
                          );

                          const shouldShowMonth =
                            columnIndex === 0 || currentMonth !== previousMonth;

                          return (
                            <div key={`month-${columnIndex}`}>
                              {shouldShowMonth && firstDay
                                ? format(
                                    new Date(`${firstDay.dateKey}T12:00:00`),
                                    'MMM',
                                    { locale: ptBR },
                                  )
                                : ''}
                            </div>
                          );
                        })}
                      </div>

                      <div className='grid grid-flow-col auto-cols-[16px] gap-2'>
                        {Array.from({
                          length: Math.ceil(heatmapDays.length / 7),
                        }).map((_, columnIndex) => {
                          const columnDays = heatmapDays.slice(
                            columnIndex * 7,
                            columnIndex * 7 + 7,
                          );

                          return (
                            <div
                              key={`heatmap-column-${columnIndex}`}
                              className='flex flex-col gap-2'
                            >
                              {columnDays.map((day) => (
                                <TooltipProvider
                                  key={day.dateKey}
                                  delayDuration={120}
                                >
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div
                                        className={cn(
                                          'h-4 w-4 rounded-[3px] border border-white/5 transition',
                                          getStatusHeatmapClassName(day.status),
                                        )}
                                      />
                                    </TooltipTrigger>

                                    <TooltipContent className='border-white/10 bg-zinc-950 text-white'>
                                      <p className='text-xs leading-5'>
                                        {day.dayLabel}
                                        {day.status
                                          ? ` • ${
                                              statusLabelMap[day.status] ??
                                              day.status
                                            }`
                                          : ' • Sem lançamento'}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-white/10 bg-zinc-900 p-4'>
              <p className='mb-3 text-sm font-medium text-white'>
                Últimos lançamentos
              </p>

              <div className='max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'>
                {attendances.length > 0 ? (
                  attendances.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className='rounded-xl border border-white/10 bg-zinc-950 p-3'
                    >
                      <p className='font-medium text-white'>{item.dateLabel}</p>
                      <p className='mt-1 text-sm text-zinc-400'>
                        {statusLabelMap[item.status] ?? item.status}
                      </p>
                      <p className='mt-1 text-xs text-zinc-500'>{item.notes}</p>
                    </div>
                  ))
                ) : (
                  <div className='rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-400'>
                    Nenhum lançamento ainda para este aluno.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
