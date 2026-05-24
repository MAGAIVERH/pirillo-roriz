'use client';

import { useMemo, useState, useTransition } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Trash2, TriangleAlert } from 'lucide-react';
import { toast } from 'sonner';

import { createInstructorStudentAttendanceAction } from '@/modules/instructor-portal/actions/create-instructor-student-attendance';
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
  allowMarking?: boolean;
  allowDelete?: boolean;
  attendanceMode?: 'admin' | 'instructor';
  isDelinquent?: boolean;
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

const getStatusHeatmapClassName = (status?: string, isInRange?: boolean) => {
  if (status === 'PRESENT') {
    return 'bg-emerald-500/80 border-emerald-400/30';
  }

  if (status === 'ABSENT') {
    return 'bg-red-500/80 border-red-400/30';
  }

  if (status === 'LATE') {
    return 'bg-amber-500/80 border-amber-400/30';
  }

  if (status === 'EXCUSED') {
    return 'bg-sky-500/80 border-sky-400/30';
  }

  if (isInRange) {
    return 'bg-zinc-700/70 border-zinc-500/25';
  }

  return 'bg-zinc-800/80 border-zinc-600/20';
};

export const StudentAttendanceHistoryCard = ({
  studentId,
  baseDateIso,
  baseDateLabel,
  showBatchControls,
  progressProjectedDateIso,
  allowMarking = true,
  allowDelete = true,
  attendanceMode = 'admin',
  isDelinquent = false,
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
      isInRange: boolean;
    }[] = [];

    const rangeStartKey = minDate ? toLocalDateKey(minDate) : null;
    const rangeEndKey = toLocalDateKey(today);

    const cursor = new Date(start);

    while (cursor <= end) {
      const dateKey = toLocalDateKey(cursor);
      const attendance = attendanceMap.get(dateKey);
      const isInRange =
        dateKey >= (rangeStartKey ?? dateKey) && dateKey <= rangeEndKey;

      days.push({
        dateKey,
        dayLabel: format(cursor, 'dd/MM'),
        status: attendance?.status,
        isInRange,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }, [attendanceMap, minDate, today]);

  const heatmapWeeks = useMemo(() => {
    const weeks: (typeof heatmapDays)[] = [];

    for (let index = 0; index < heatmapDays.length; index += 7) {
      weeks.push(heatmapDays.slice(index, index + 7));
    }

    return weeks;
  }, [heatmapDays]);

  const weekDayLabels = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

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
    if (!allowMarking) {
      toast.error('Lançamento de presença indisponível para este aluno.');
      return;
    }

    if (selectedDates.length === 0) {
      toast.error('Selecione pelo menos uma data no calendário.');
      return;
    }

    if (attendanceMode === 'instructor' && selectedDates.length > 1) {
      toast.error('Selecione apenas uma data por vez.');
      return;
    }

    startSaving(async () => {
      if (selectedDates.length === 1 && selectedDate) {
        const payload = {
          studentId,
          attendanceDate: toLocalDateKey(selectedDate),
          status,
          notes,
        };

        const result =
          attendanceMode === 'instructor'
            ? await createInstructorStudentAttendanceAction(payload)
            : await createStudentManualAttendanceAction(payload);

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
    <Card className='min-w-0 overflow-hidden border-white/10 bg-zinc-950 text-white'>
      <CardHeader className='p-4 sm:p-6'>
        <CardTitle className='text-lg sm:text-xl'>Calendário de presença</CardTitle>
        <p className='text-sm leading-6 text-zinc-400'>
          {attendanceMode === 'instructor'
            ? 'Marque presenças dos alunos e acompanhe a jornada até a próxima graduação.'
            : 'Lance presenças retroativas e acompanhe a jornada até a próxima graduação.'}
        </p>
      </CardHeader>

      <CardContent className='min-w-0 space-y-6 p-4 pt-0 sm:p-6 sm:pt-0'>
        {isDelinquent ? (
          <div className='rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4'>
            <div className='flex items-start gap-3'>
              <TriangleAlert className='mt-0.5 h-4 w-4 shrink-0 text-amber-400' />
              <div>
                <p className='text-sm font-medium text-amber-100'>
                  Aluno inadimplente
                </p>
                <p className='mt-1 text-xs leading-5 text-amber-200/80'>
                  Este aluno pode treinar, mas não é possível lançar presença
                  enquanto a mensalidade estiver em atraso. Presenças não
                  contabilizam para graduação neste período.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {showBatchControls ? (
          <div className='w-full rounded-2xl border border-white/10 bg-zinc-900 p-4'>
            <div className='space-y-4'>
              <div className='flex items-start gap-3'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-zinc-950 text-zinc-400'>
                  <CalendarIcon className='h-4 w-4' />
                </div>

                <div className='min-w-0 space-y-1'>
                  <p className='text-sm font-medium leading-6 wrap-break-word text-white'>
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

              <div className='flex flex-col gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-xs font-medium uppercase tracking-wide text-zinc-400'>
                  Status atual
                </p>

                <Badge
                  variant='outline'
                  className='w-fit border-white/10 bg-zinc-900 text-zinc-200'
                >
                  {selectedDates.length > 1
                    ? 'Aplicação em lote'
                    : selectedAttendance
                      ? (statusLabelMap[selectedAttendance.status] ??
                        selectedAttendance.status)
                      : 'Sem lançamento'}
                </Badge>
              </div>
            </div>
          </div>
        ) : null}

        <div className='grid min-w-0 gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start'>
          <section className='min-w-0 space-y-4 lg:sticky lg:top-24'>
            <div className='rounded-2xl border border-white/10 bg-zinc-900 p-3 sm:p-4'>
              <p className='mb-3 text-sm font-medium text-white'>
                Lançamento manual
              </p>

              <div className='flex justify-center overflow-hidden'>
                <Calendar
                  mode='multiple'
                  selected={selectedDates}
                  onSelect={allowMarking ? handleSelectedDatesChange : undefined}
                  locale={ptBR}
                  disabled={[
                    { after: today },
                    ...(minDate ? [{ before: minDate }] : []),
                    ...(!allowMarking ? [{ before: new Date('2099-01-01') }] : []),
                  ]}
                  className='w-full max-w-full rounded-md bg-zinc-900 text-white'
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
              </div>

              {!showBatchControls ? (
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
              ) : null}

              <div className='mt-3 rounded-xl border border-white/10 bg-zinc-950/60 p-3 text-xs text-zinc-400'>
                {baseDateLabel
                  ? `Lançamentos permitidos de ${baseDateLabel} até hoje.`
                  : 'Lançamentos permitidos até hoje.'}
              </div>

              <div className='mt-4 grid grid-cols-2 gap-2 sm:gap-3'>
                {statusButtonMap.map((item) => (
                  <Button
                    key={item.value}
                    type='button'
                    variant='outline'
                    disabled={
                      !allowMarking ||
                      isSaving ||
                      isDeleting ||
                      selectedDates.length === 0
                    }
                    onClick={() => handleSave(item.value)}
                    className={cn(
                      'h-10 border px-2 text-xs transition sm:h-11 sm:px-3 sm:text-sm',
                      item.className,
                    )}
                  >
                    {isSaving ? 'Salvando...' : item.label}
                  </Button>
                ))}
              </div>

              {allowDelete ? (
                <div className='mt-3'>
                  <Button
                    type='button'
                    variant='outline'
                    disabled={
                      !allowMarking ||
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
              ) : null}

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
                  className='min-h-24 border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-28'
                />
                <p className='mt-2 text-xs text-zinc-500'>
                  {canEditNotes
                    ? 'A observação será vinculada somente ao dia selecionado.'
                    : 'Para evitar confusão, observações só podem ser lançadas com 1 dia selecionado.'}
                </p>
              </div>
            </div>
          </section>

          <section className='min-w-0 space-y-4'>
            <div className='rounded-2xl border border-white/10 bg-zinc-900 p-3 sm:p-4'>
              <div className='space-y-1'>
                <p className='text-sm font-medium text-white'>
                  Consistência de treino
                </p>
                <p className='text-xs text-zinc-400'>
                  Jornada visual do aluno até a próxima graduação.
                </p>
              </div>

              <div className='mt-4 rounded-xl border border-white/10 bg-zinc-950 p-3 sm:p-4'>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <span className='text-xs text-zinc-400'>Data base</span>
                  <Badge
                    variant='outline'
                    className='w-fit border-white/10 bg-zinc-900 text-zinc-200'
                  >
                    {progressPercentage}% da jornada
                  </Badge>
                  <span className='text-xs text-zinc-400 sm:text-right'>
                    Próxima graduação
                  </span>
                </div>

                <div className='mt-3 flex items-center gap-2 sm:gap-3'>
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-sm sm:h-9 sm:w-9'>
                    🥋
                  </div>

                  <div className='h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-800 sm:h-3'>
                    <div
                      className='h-full rounded-full bg-emerald-500 transition-all'
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-sm sm:h-9 sm:w-9'>
                    🏆
                  </div>
                </div>

                <div className='mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-400'>
                  <span className='truncate'>{baseDateLabel ?? 'Data base'}</span>
                  <span className='truncate text-right'>{projectedDateLabel}</span>
                </div>

                <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3'>
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

                <div className='mt-3 text-xs leading-5 text-zinc-400'>
                  {elapsedProgressDays} dias percorridos desde a data base •{' '}
                  {remainingDays} dias restantes estimados
                </div>
              </div>

              <div className='mt-4 min-w-0 rounded-xl border border-white/10 bg-zinc-950 p-3 sm:p-4'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <p className='text-xs font-medium uppercase tracking-wide text-zinc-400'>
                    Heatmap da jornada
                  </p>

                  <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500 sm:text-[11px]'>
                    <span className='flex items-center gap-1'>
                      <span className='h-2.5 w-2.5 rounded-[2px] bg-emerald-500/70' />
                      Presente
                    </span>
                    <span className='flex items-center gap-1'>
                      <span className='h-2.5 w-2.5 rounded-[2px] bg-red-500/70' />
                      Falta
                    </span>
                    <span className='flex items-center gap-1'>
                      <span className='h-2.5 w-2.5 rounded-[2px] bg-amber-500/70' />
                      Atraso
                    </span>
                    <span className='flex items-center gap-1'>
                      <span className='h-2.5 w-2.5 rounded-[2px] bg-sky-500/70' />
                      Justif.
                    </span>
                    <span className='flex items-center gap-1'>
                      <span className='h-2.5 w-2.5 rounded-[2px] border border-zinc-500/25 bg-zinc-700/70' />
                      Sem lanç.
                    </span>
                  </div>
                </div>

                <p className='mt-2 text-[10px] text-zinc-500 lg:hidden'>
                  Deslize horizontalmente para ver toda a jornada.
                </p>

                <div className='mt-3 overflow-x-auto overscroll-x-contain scrollbar-hide'>
                  <div className='inline-flex min-w-max gap-2 pb-1'>
                    <div className='sticky left-0 z-10 shrink-0 bg-zinc-950 pt-6 pr-1 shadow-[6px_0_12px_-6px_rgba(0,0,0,0.9)]'>
                      <div className='grid auto-rows-[14px] gap-1.5'>
                        {weekDayLabels.map((label, index) => (
                          <span
                            key={`weekday-${index}`}
                            className='flex h-3.5 w-4 items-center justify-center text-[10px] text-zinc-500 sm:text-[11px]'
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className='min-w-max'>
                      <div className='relative mb-2 flex gap-1.5'>
                        {heatmapWeeks.map((week, weekIndex) => {
                          const firstDay = week[0];
                          const previousWeek =
                            weekIndex > 0 ? heatmapWeeks[weekIndex - 1] : null;
                          const currentMonth = firstDay?.dateKey.slice(0, 7);
                          const previousMonth =
                            previousWeek?.[0]?.dateKey.slice(0, 7);
                          const shouldShowMonth =
                            weekIndex === 0 || currentMonth !== previousMonth;

                          return (
                            <div
                              key={`month-${weekIndex}`}
                              className='relative h-4 w-3.5 shrink-0 sm:w-4'
                            >
                              {shouldShowMonth && firstDay ? (
                                <span className='absolute left-0 top-0 whitespace-nowrap text-[10px] font-medium uppercase text-zinc-400 sm:text-[11px]'>
                                  {format(
                                    new Date(`${firstDay.dateKey}T12:00:00`),
                                    'MMM',
                                    { locale: ptBR },
                                  ).replace('.', '')}
                                </span>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>

                      <div className='flex gap-1.5'>
                        {heatmapWeeks.map((week, weekIndex) => (
                          <div
                            key={`heatmap-week-${weekIndex}`}
                            className='flex flex-col gap-1.5'
                          >
                            {week.map((day) => (
                              <TooltipProvider
                                key={day.dateKey}
                                delayDuration={120}
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div
                                      className={cn(
                                        'h-3.5 w-3.5 rounded-[3px] border sm:h-4 sm:w-4',
                                        getStatusHeatmapClassName(
                                          day.status,
                                          day.isInRange,
                                        ),
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
                                        : day.isInRange
                                          ? ' • Sem lançamento'
                                          : ' • Fora da jornada'}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-white/10 bg-zinc-900 p-3 sm:p-4'>
              <p className='mb-3 text-sm font-medium text-white'>
                Últimos lançamentos
              </p>

              <div className='max-h-80 space-y-3 overflow-y-auto pr-1 scrollbar-hide [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden'>
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
                      {item.notes && item.notes !== '-' ? (
                        <p className='mt-1 text-xs leading-5 wrap-break-word text-zinc-500'>
                          {item.notes}
                        </p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className='rounded-xl border border-white/10 bg-zinc-950 p-4 text-sm text-zinc-400'>
                    Nenhum lançamento ainda para este aluno.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  );
};
