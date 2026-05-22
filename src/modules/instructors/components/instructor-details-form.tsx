'use client';

import { useState, useTransition } from 'react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

import { updateInstructorAction } from '@/modules/instructors/actions/update-instructor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateInput } from '@/components/ui/date-input';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type InstructorDetailsFormProps = {
  instructor: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    active: boolean;
    birthDate: string;
    belt: string;
    beltDegree: number;
    notes: string;
  };
};

const beltOptions = [
  'Branca',
  'Azul',
  'Roxa',
  'Marrom',
  'Preta',
  'Coral',
  'Vermelha',
];

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (!digits) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const InstructorDetailsForm = ({
  instructor,
}: InstructorDetailsFormProps) => {
  const [fullName, setFullName] = useState(instructor.fullName);
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    instructor.birthDate ? parseISO(instructor.birthDate) : undefined,
  );
  const [email, setEmail] = useState(instructor.email);
  const [phone, setPhone] = useState(instructor.phone);
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(
    instructor.active ? 'ACTIVE' : 'INACTIVE',
  );
  const [belt, setBelt] = useState(instructor.belt);
  const [beltDegree, setBeltDegree] = useState(String(instructor.beltDegree));
  const [notes, setNotes] = useState(instructor.notes);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await updateInstructorAction({
        instructorId: instructor.id,
        fullName,
        birthDate: birthDate ? format(birthDate, 'yyyy-MM-dd') : '',
        email,
        phone,
        status,
        belt,
        beltDegree,
        notes,
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
      <CardHeader>
        <CardTitle className='text-xl'>Dados do professor</CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        <div className='grid gap-4 lg:grid-cols-2'>
          <div className='space-y-2 lg:col-span-2'>
            <p className='text-sm text-zinc-400'>Nome completo</p>
            <Input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className='border-white/10 bg-zinc-900 text-white'
            />
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Data de nascimento</p>

            <DateInput
              value={birthDate}
              onChange={setBirthDate}
              minDate={new Date(1940, 0, 1)}
              maxDate={new Date()}
              defaultMonth={new Date(1995, 0)}
              ariaLabel='Data de nascimento'
            />
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Status</p>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(value as 'ACTIVE' | 'INACTIVE')
              }
            >
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='ACTIVE'>Ativo</SelectItem>
                <SelectItem value='INACTIVE'>Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Email</p>
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className='border-white/10 bg-zinc-900 text-white'
            />
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Telefone</p>
            <Input
              value={phone}
              onChange={(event) => setPhone(formatPhone(event.target.value))}
              className='border-white/10 bg-zinc-900 text-white'
            />
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Faixa</p>
            <Select value={belt} onValueChange={setBelt}>
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione a faixa' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                {beltOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Grau</p>
            <Input
              type='number'
              min={0}
              max={6}
              value={beltDegree}
              onChange={(event) => setBeltDegree(event.target.value)}
              className='border-white/10 bg-zinc-900 text-white'
            />
          </div>

          <div className='space-y-2 lg:col-span-2'>
            <p className='text-sm text-zinc-400'>Observações</p>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className='min-h-32 border-white/10 bg-zinc-900 text-white'
            />
          </div>
        </div>

        <div className='flex justify-end'>
          <Button
            type='button'
            onClick={handleSubmit}
            disabled={isPending}
            className='bg-red-600 text-white hover:bg-red-500'
          >
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
