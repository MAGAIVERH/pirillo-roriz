'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { z } from 'zod';

import { createInstructorAction } from '@/modules/instructors/actions/create-instructor';

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
import { cn } from '@/lib/utils';
import {
  FormField,
  formCardClassName,
  formCardContentClassName,
  formCardHeaderClassName,
  formGridClassName,
  formInputClassName,
  formSelectContentClassName,
  formSelectTriggerClassName,
} from '@/components/forms/form-field';
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
    <Card className={formCardClassName}>
      <CardHeader className={formCardHeaderClassName}>
        <CardTitle className='text-lg font-semibold'>Dados do professor</CardTitle>
      </CardHeader>

      <CardContent className={cn(formCardContentClassName, 'space-y-5')}>
        <div className={formGridClassName}>
          <FormField
            label='Nome completo'
            htmlFor='fullName'
            error={errors.fullName}
            className='md:col-span-2'
          >
            <Input
              id='fullName'
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                clearFieldError('fullName');
              }}
              placeholder='Digite o nome completo do professor'
              className={formInputClassName}
            />
          </FormField>

          <FormField label='Data de nascimento' error={errors.birthDate}>
            <DateInput
              value={birthDate}
              onChange={(date) => {
                setBirthDate(date);
                clearFieldError('birthDate');
              }}
              minDate={new Date(1940, 0, 1)}
              maxDate={new Date()}
              defaultMonth={new Date(1995, 0)}
              invalid={Boolean(errors.birthDate)}
              ariaLabel='Data de nascimento'
            />
          </FormField>

          <FormField label='Status' error={errors.status}>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as 'ACTIVE' | 'INACTIVE');
                clearFieldError('status');
              }}
            >
              <SelectTrigger className={formSelectTriggerClassName}>
                <SelectValue placeholder='Selecione o status' />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName}>
                <SelectItem value='ACTIVE'>Ativo</SelectItem>
                <SelectItem value='INACTIVE'>Inativo</SelectItem>
              </SelectContent>
            </Select>
          </FormField>

          <FormField label='Email' htmlFor='email' error={errors.email}>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearFieldError('email');
              }}
              placeholder='email@exemplo.com'
              className={formInputClassName}
            />
          </FormField>

          <FormField label='Telefone' htmlFor='phone' error={errors.phone}>
            <Input
              id='phone'
              value={phone}
              onChange={(event) => {
                setPhone(formatPhone(event.target.value));
                clearFieldError('phone');
              }}
              placeholder='(85) 99999-9999'
              className={formInputClassName}
            />
          </FormField>

          <FormField label='Faixa' error={errors.belt}>
            <Select
              value={belt}
              onValueChange={(value) => {
                setBelt(value);
                clearFieldError('belt');
              }}
            >
              <SelectTrigger className={formSelectTriggerClassName}>
                <SelectValue placeholder='Selecione a faixa' />
              </SelectTrigger>
              <SelectContent className={formSelectContentClassName}>
                {beltOptions.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label='Grau' htmlFor='beltDegree' error={errors.beltDegree}>
            <Input
              id='beltDegree'
              type='number'
              min={0}
              max={6}
              value={beltDegree}
              onChange={(event) => {
                setBeltDegree(event.target.value);
                clearFieldError('beltDegree');
              }}
              placeholder='0'
              className={cn(formInputClassName, 'max-w-[7rem]')}
            />
          </FormField>

          <FormField label='Observações' htmlFor='notes' className='md:col-span-2'>
            <Textarea
              id='notes'
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder='Informações adicionais sobre o professor'
              className='min-h-28 border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
            />
          </FormField>
        </div>

        <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
            disabled={isPending}
            onClick={() => router.push('/admin/professores')}
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
