'use client';

import { useEffect, useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

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
import { createClassScheduleAction } from '@/modules/classes/actions/create-class-schedule';
import { deleteClassScheduleAction } from '@/modules/classes/actions/delete-class-schedule';
import { updateClassSettingsAction } from '@/modules/classes/actions/update-class-settings';

type ClassScheduleManagerProps = {
  classId: string;
  currentName: string;
  currentTypeName: string;
  currentCapacity: number | null;
  schedules: {
    id: string;
    weekDay: string;
    weekDayLabel: string;
    startTime: string;
    endTime: string;
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

const weekDays: { value: WeekDayValue; label: string }[] = [
  { value: 'MONDAY', label: 'Segunda-feira' },
  { value: 'TUESDAY', label: 'Terça-feira' },
  { value: 'WEDNESDAY', label: 'Quarta-feira' },
  { value: 'THURSDAY', label: 'Quinta-feira' },
  { value: 'FRIDAY', label: 'Sexta-feira' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

export const ClassScheduleManager = ({
  classId,
  currentName,
  currentTypeName,
  currentCapacity,
  schedules,
}: ClassScheduleManagerProps) => {
  const [name, setName] = useState(currentName);
  const [classTypeName, setClassTypeName] = useState(currentTypeName);
  const [capacity, setCapacity] = useState(
    currentCapacity ? String(currentCapacity) : '',
  );

  const [weekDay, setWeekDay] = useState<WeekDayValue | ''>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [isUpdatingSettings, startSettingsTransition] = useTransition();
  const [isCreating, startCreateTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  useEffect(() => {
    setClassTypeName(currentTypeName);
  }, [currentTypeName]);

  useEffect(() => {
    setCapacity(currentCapacity ? String(currentCapacity) : '');
  }, [currentCapacity]);

  const handleUpdateSettings = () => {
    startSettingsTransition(async () => {
      const result = await updateClassSettingsAction({
        classId,
        name,
        classTypeName,
        capacity,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  };

  const handleCreateSchedule = () => {
    startCreateTransition(async () => {
      const result = await createClassScheduleAction({
        classId,
        weekDay: weekDay as WeekDayValue,
        startTime,
        endTime,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setWeekDay('');
      setStartTime('');
      setEndTime('');
    });
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setDeletingId(scheduleId);

    void (async () => {
      const result = await deleteClassScheduleAction({
        scheduleId,
        classId,
      });

      if (!result.success) {
        toast.error(result.message);
        setDeletingId(null);
        return;
      }

      toast.success(result.message);
      setDeletingId(null);
    })();
  };

  return (
    <div className='space-y-6'>
      <Card className='border-white/10 bg-zinc-950 text-white'>
        <CardHeader>
          <CardTitle className='text-xl'>Configurações básicas</CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4 lg:grid-cols-[1.3fr_1fr_0.8fr_auto] lg:items-end'>
          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Nome da turma</p>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder='Digite o nome da turma'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Tipo da turma</p>
            <Input
              value={classTypeName}
              onChange={(event) => setClassTypeName(event.target.value)}
              placeholder='Digite o tipo da turma'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Capacidade da turma</p>
            <Input
              type='number'
              min={1}
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              placeholder='Informe a capacidade'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>

          <Button
            type='button'
            onClick={handleUpdateSettings}
            disabled={isUpdatingSettings}
            className='bg-red-600 text-white hover:bg-red-500'
          >
            {isUpdatingSettings ? 'Salvando...' : 'Salvar'}
          </Button>
        </CardContent>
      </Card>

      <div className='grid gap-6 xl:grid-cols-[1fr_1.1fr]'>
        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-xl'>Novo horário</CardTitle>
          </CardHeader>

          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <p className='text-sm text-zinc-400'>Dia da semana</p>
              <Select
                value={weekDay}
                onValueChange={(value) => setWeekDay(value as WeekDayValue)}
              >
                <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
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

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <p className='text-sm text-zinc-400'>Hora inicial</p>
                <input
                  type='time'
                  value={startTime}
                  onChange={(event) => setStartTime(event.target.value)}
                  className='h-10 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none'
                />
              </div>

              <div className='space-y-2'>
                <p className='text-sm text-zinc-400'>Hora final</p>
                <input
                  type='time'
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className='h-10 w-full rounded-md border border-white/10 bg-zinc-900 px-3 text-sm text-white outline-none'
                />
              </div>
            </div>

            <Button
              type='button'
              onClick={handleCreateSchedule}
              disabled={isCreating}
              className='w-full bg-red-600 text-white hover:bg-red-500'
            >
              {isCreating ? 'Salvando horário...' : 'Adicionar horário'}
            </Button>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-xl'>Horários cadastrados</CardTitle>
          </CardHeader>

          <CardContent className='space-y-3'>
            {schedules.length > 0 ? (
              schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className='flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-900 p-4 sm:flex-row sm:items-center sm:justify-between'
                >
                  <div className='space-y-1'>
                    <p className='font-medium text-white'>
                      {schedule.weekDayLabel}
                    </p>
                    <p className='text-sm text-zinc-400'>
                      {schedule.startTime} às {schedule.endTime}
                    </p>
                  </div>

                  <Button
                    type='button'
                    variant='outline'
                    disabled={deletingId === schedule.id}
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className='border-white/10 bg-zinc-950 text-white hover:bg-zinc-800 hover:text-white'
                  >
                    <Trash2 className='mr-2 h-4 w-4' />
                    {deletingId === schedule.id ? 'Removendo...' : 'Remover'}
                  </Button>
                </div>
              ))
            ) : (
              <div className='rounded-xl border border-white/10 bg-zinc-900 p-4 text-sm text-zinc-400'>
                Nenhum horário cadastrado para essa turma.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
