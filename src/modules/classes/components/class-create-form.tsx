'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { createClassCompleteAction } from '@/modules/classes/actions/create-class-complete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ClassCreateFormProps = {
  availableProfessors: {
    id: string;
    fullName: string;
  }[];
};

type WeekDayValue =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

type ScheduleInput = {
  id: string;
  weekDay: WeekDayValue | '';
  startTime: string;
  endTime: string;
};

const weekDays: { value: WeekDayValue; label: string }[] = [
  { value: 'MONDAY', label: 'Segunda-feira' },
  { value: 'TUESDAY', label: 'Terça-feira' },
  { value: 'WEDNESDAY', label: 'Quarta-feira' },
  { value: 'THURSDAY', label: 'Quinta-feira' },
  { value: 'FRIDAY', label: 'Sexta-feira' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

const createEmptySchedule = (): ScheduleInput => ({
  id: crypto.randomUUID(),
  weekDay: '',
  startTime: '',
  endTime: '',
});

const formatTimeInput = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

const normalizeTime = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 4);

  if (digits.length !== 4) {
    return value;
  }

  let hours = Number(digits.slice(0, 2));
  let minutes = Number(digits.slice(2, 4));

  if (Number.isNaN(hours)) {
    hours = 0;
  }

  if (Number.isNaN(minutes)) {
    minutes = 0;
  }

  if (hours > 23) {
    hours = 23;
  }

  if (minutes > 59) {
    minutes = 59;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0',
  )}`;
};

const isValidTime = (value: string) => {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    return false;
  }

  const [hours, minutes] = value.split(':').map(Number);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

export const ClassCreateForm = ({
  availableProfessors,
}: ClassCreateFormProps) => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [classTypeName, setClassTypeName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [schedules, setSchedules] = useState<ScheduleInput[]>([
    createEmptySchedule(),
  ]);
  const [isPending, startTransition] = useTransition();

  const handleAddSchedule = () => {
    setSchedules((prev) => [...prev, createEmptySchedule()]);
  };

  const handleRemoveSchedule = (scheduleId: string) => {
    setSchedules((prev) => {
      if (prev.length === 1) {
        return prev;
      }

      return prev.filter((item) => item.id !== scheduleId);
    });
  };

  const handleScheduleChange = (
    scheduleId: string,
    field: keyof Omit<ScheduleInput, 'id'>,
    value: string,
  ) => {
    setSchedules((prev) =>
      prev.map((item) =>
        item.id === scheduleId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleTimeBlur = (
    scheduleId: string,
    field: 'startTime' | 'endTime',
    value: string,
  ) => {
    if (!value) {
      return;
    }

    const normalized = normalizeTime(value);
    handleScheduleChange(scheduleId, field, normalized);

    if (!isValidTime(normalized)) {
      toast.error('Use o formato HH:mm. Exemplo: 18:30');
    }
  };

  const handleSubmit = () => {
    const hasEmptyWeekDay = schedules.some((item) => !item.weekDay);
    if (hasEmptyWeekDay) {
      toast.error('Selecione o dia da semana em todos os horários.');
      return;
    }

    const hasInvalidTime = schedules.some(
      (item) => !isValidTime(item.startTime) || !isValidTime(item.endTime),
    );

    if (hasInvalidTime) {
      toast.error('Preencha todos os horários no formato HH:mm.');
      return;
    }

    startTransition(async () => {
      const result = await createClassCompleteAction({
        name,
        classTypeName,
        capacity,
        instructorId,
        schedules: schedules.map((item) => ({
          weekDay: item.weekDay as WeekDayValue,
          startTime: normalizeTime(item.startTime),
          endTime: normalizeTime(item.endTime),
        })),
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setTimeout(() => {
        router.push('/admin/turmas');
        router.refresh();
      }, 400);
    });
  };

  return (
    <div className='space-y-6'>
      <Card className='border-white/10 bg-zinc-950 text-white'>
        <CardHeader>
          <CardTitle className='text-xl'>Dados da nova turma</CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4 lg:grid-cols-2'>
          <div className='space-y-2 lg:col-span-2'>
            <p className='text-sm text-zinc-400'>Nome da turma</p>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Ex: Jiu-Jitsu Adulto Iniciante'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Tipo da turma</p>
            <Input
              value={classTypeName}
              onChange={(event) => setClassTypeName(event.target.value)}
              placeholder='Ex: Jiu-Jitsu Adulto'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Capacidade</p>
            <Input
              type='number'
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              placeholder='Opcional'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <div className='space-y-2 lg:col-span-2'>
            <p className='text-sm text-zinc-400'>Professor responsável</p>
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione um professor' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                {availableProfessors.length > 0 ? (
                  availableProfessors.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.fullName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value='__empty' disabled>
                    Nenhum professor cadastrado
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className='border-white/10 bg-zinc-950 text-white'>
        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
          <CardTitle className='text-xl'>Horários iniciais</CardTitle>

          <Button
            type='button'
            variant='outline'
            onClick={handleAddSchedule}
            className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
          >
            Adicionar horário
          </Button>
        </CardHeader>

        <CardContent className='space-y-4'>
          {schedules.map((schedule, index) => (
            <div
              key={schedule.id}
              className='rounded-xl border border-white/10 bg-zinc-900 p-4'
            >
              <div className='mb-4 flex items-center justify-between'>
                <p className='text-sm font-medium text-white'>
                  Horário {index + 1}
                </p>

                <Button
                  type='button'
                  variant='outline'
                  disabled={schedules.length === 1}
                  onClick={() => handleRemoveSchedule(schedule.id)}
                  className='border-white/10 bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Remover
                </Button>
              </div>

              <div className='grid gap-4 lg:grid-cols-3'>
                <div className='space-y-2'>
                  <p className='text-sm text-zinc-400'>Dia da semana</p>
                  <Select
                    value={schedule.weekDay}
                    onValueChange={(value) =>
                      handleScheduleChange(schedule.id, 'weekDay', value)
                    }
                  >
                    <SelectTrigger className='border-white/10 bg-zinc-950 text-white'>
                      <SelectValue placeholder='Selecione o dia' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                      {weekDays.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <p className='text-sm text-zinc-400'>Hora inicial</p>
                  <Input
                    value={schedule.startTime}
                    onChange={(event) =>
                      handleScheduleChange(
                        schedule.id,
                        'startTime',
                        formatTimeInput(event.target.value),
                      )
                    }
                    onBlur={(event) =>
                      handleTimeBlur(
                        schedule.id,
                        'startTime',
                        event.target.value,
                      )
                    }
                    placeholder='HH:mm'
                    inputMode='numeric'
                    className='border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500'
                  />
                </div>

                <div className='space-y-2'>
                  <p className='text-sm text-zinc-400'>Hora final</p>
                  <Input
                    value={schedule.endTime}
                    onChange={(event) =>
                      handleScheduleChange(
                        schedule.id,
                        'endTime',
                        formatTimeInput(event.target.value),
                      )
                    }
                    onBlur={(event) =>
                      handleTimeBlur(schedule.id, 'endTime', event.target.value)
                    }
                    placeholder='HH:mm'
                    inputMode='numeric'
                    className='border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500'
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
        <Button
          type='button'
          variant='outline'
          className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
        >
          Cancelar
        </Button>

        <Button
          type='button'
          onClick={handleSubmit}
          disabled={isPending}
          className='bg-red-600 text-white hover:bg-red-500'
        >
          {isPending ? 'Criando turma...' : 'Criar turma'}
        </Button>
      </div>
    </div>
  );
};
