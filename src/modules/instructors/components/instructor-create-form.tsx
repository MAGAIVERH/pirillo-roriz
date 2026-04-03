'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { z } from 'zod';

import { createInstructorAction } from '@/modules/instructors/actions/create-instructor';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  CreateInstructorFormData,
  createInstructorSchema,
} from '../schema/create-instructor-schema';

const beltOptions = [
  'Branca',
  'Azul',
  'Roxa',
  'Marrom',
  'Preta',
  'Coral',
  'Vermelha',
] as const;

type FormErrors = Partial<Record<keyof CreateInstructorFormData, string>>;

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

const getFieldErrorMap = (error: z.ZodError<CreateInstructorFormData>) => {
  const errors: FormErrors = {};

  error.issues.forEach((issue) => {
    const field = issue.path[0] as keyof CreateInstructorFormData | undefined;

    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  });

  return errors;
};

export const InstructorCreateForm = () => {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | ''>('');
  const [belt, setBelt] = useState('');
  const [beltDegree, setBeltDegree] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isPending, startTransition] = useTransition();

  const clearFieldError = (field: keyof CreateInstructorFormData) => {
    setErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return {
        ...prev,
        [field]: undefined,
      };
    });
  };

  const handleSubmit = () => {
    const formData: CreateInstructorFormData = {
      fullName,
      birthDate: birthDate ? format(birthDate, 'yyyy-MM-dd') : '',
      email,
      phone,
      status: status as 'ACTIVE' | 'INACTIVE',
      belt,
      beltDegree,
      notes,
    };

    const parsed = createInstructorSchema.safeParse(formData);

    if (!parsed.success) {
      setErrors(getFieldErrorMap(parsed.error));
      return;
    }

    setErrors({});

    startTransition(async () => {
      const result = await createInstructorAction(parsed.data);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setTimeout(() => {
        router.push('/admin/professores');
        router.refresh();
      }, 400);
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
              onChange={(event) => {
                setFullName(event.target.value);
                clearFieldError('fullName');
              }}
              placeholder='Digite o nome completo do professor'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
            {errors.fullName ? (
              <p className='text-sm text-red-400'>{errors.fullName}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Data de nascimento</p>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type='button'
                  variant='outline'
                  className={cn(
                    'w-full justify-start border-white/10 bg-zinc-900 text-left font-normal text-white hover:bg-zinc-800 hover:text-white',
                    !birthDate && 'text-zinc-500',
                  )}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  {birthDate
                    ? format(birthDate, 'dd/MM/yyyy', { locale: ptBR })
                    : 'Selecione a data'}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                className='w-auto border-white/10 bg-zinc-950 p-0 text-white'
                align='start'
              >
                <Calendar
                  mode='single'
                  selected={birthDate}
                  onSelect={(date) => {
                    setBirthDate(date);
                    clearFieldError('birthDate');
                  }}
                  captionLayout='dropdown'
                  fromYear={1940}
                  toYear={new Date().getFullYear()}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {errors.birthDate ? (
              <p className='text-sm text-red-400'>{errors.birthDate}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Status</p>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as 'ACTIVE' | 'INACTIVE');
                clearFieldError('status');
              }}
            >
              <SelectTrigger className='border-white/10 bg-zinc-900 text-white'>
                <SelectValue placeholder='Selecione o status' />
              </SelectTrigger>
              <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                <SelectItem value='ACTIVE'>Ativo</SelectItem>
                <SelectItem value='INACTIVE'>Inativo</SelectItem>
              </SelectContent>
            </Select>
            {errors.status ? (
              <p className='text-sm text-red-400'>{errors.status}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Email</p>
            <Input
              type='email'
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError('email');
              }}
              placeholder='email@exemplo.com'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
            {errors.email ? (
              <p className='text-sm text-red-400'>{errors.email}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Telefone</p>
            <Input
              value={phone}
              onChange={(event) => {
                setPhone(formatPhone(event.target.value));
                clearFieldError('phone');
              }}
              placeholder='(85) 99999-9999'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
            {errors.phone ? (
              <p className='text-sm text-red-400'>{errors.phone}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Faixa</p>
            <Select
              value={belt}
              onValueChange={(value) => {
                setBelt(value);
                clearFieldError('belt');
              }}
            >
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
            {errors.belt ? (
              <p className='text-sm text-red-400'>{errors.belt}</p>
            ) : null}
          </div>

          <div className='space-y-2'>
            <p className='text-sm text-zinc-400'>Grau</p>
            <Input
              type='number'
              min={0}
              max={6}
              value={beltDegree}
              onChange={(event) => {
                setBeltDegree(event.target.value);
                clearFieldError('beltDegree');
              }}
              placeholder='0'
              className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
            {errors.beltDegree ? (
              <p className='text-sm text-red-400'>{errors.beltDegree}</p>
            ) : null}
          </div>

          <div className='space-y-2 lg:col-span-2'>
            <p className='text-sm text-zinc-400'>Observações</p>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder='Informações adicionais sobre o professor'
              className='min-h-32 border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </div>
        </div>

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
            {isPending ? 'Salvando...' : 'Cadastrar professor'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
