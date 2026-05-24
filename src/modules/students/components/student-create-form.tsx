'use client';

import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Controller, useForm, useWatch } from 'react-hook-form';

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
  createStudentSchema,
  type CreateStudentSchema,
} from '@/modules/students/schemas/create-student-schema';

type StudentCreateFormProps = {
  onSubmitAction: (values: CreateStudentSchema) => Promise<{
    success: boolean;
    message: string;
    studentId?: string;
  }>;
  belts: {
    id: string;
    name: string;
    adultCategory: boolean;
    juvenileCategory: boolean;
  }[];
  classes: {
    id: string;
    name: string;
  }[];
  leadSources: {
    id: string;
    name: string;
  }[];
  plans: {
    id: string;
    name: string;
    priceInCents: number;
    billingCycle: string;
  }[];
};

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

export const StudentCreateForm = ({
  onSubmitAction,
  belts,
  classes,
  leadSources,
  plans,
}: StudentCreateFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateStudentSchema>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      fullName: '',
      preferredName: '',
      email: '',
      phone: '',
      gender: '',
      status: '',
      beltId: '',
      planId: '',
      mainClassId: '',
      goal: '',
      leadSourceId: '',
      studentHistoryType: 'new',
      progressionStartDate: new Date(),
      notes: '',
    },
  });

  const studentHistoryType = useWatch({
    control: form.control,
    name: 'studentHistoryType',
  });

  const progressionStartDate = useWatch({
    control: form.control,
    name: 'progressionStartDate',
  });

  useEffect(() => {
    if (progressionStartDate) {
      form.setValue('billingDueDay', progressionStartDate.getDate());
    }
  }, [progressionStartDate, form]);

  const onSubmit = (values: CreateStudentSchema) => {
    startTransition(async () => {
      const result = await onSubmitAction(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      form.reset({
        fullName: '',
        preferredName: '',
        birthDate: undefined,
        email: '',
        phone: '',
        gender: '',
        status: '',
        beltId: '',
        mainClassId: '',
        goal: '',
        leadSourceId: '',
        studentHistoryType: 'new',
        progressionStartDate: new Date(),
        billingDueDay: new Date().getDate(),
        notes: '',
      });

      setTimeout(() => {
        router.push('/admin/alunos');
        router.refresh();
      }, 400);
    });
  };

  return (
    <div className='space-y-5'>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className='space-y-5'
      >
        <Card className={formCardClassName}>
          <CardHeader className={formCardHeaderClassName}>
            <CardTitle className='text-lg font-semibold'>Dados principais</CardTitle>
          </CardHeader>

          <CardContent className={cn(formCardContentClassName, formGridClassName)}>
            <Controller
              name='fullName'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Nome completo'
                  htmlFor='fullName'
                  error={fieldState.error?.message}
                  className='md:col-span-2'
                >
                  <Input
                    id='fullName'
                    placeholder='Digite o nome completo do aluno'
                    className={formInputClassName}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </FormField>
              )}
            />

            <Controller
              name='preferredName'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Nome preferido'
                  htmlFor='preferredName'
                  error={fieldState.error?.message}
                >
                  <Input
                    id='preferredName'
                    placeholder='Como prefere ser chamado'
                    className={formInputClassName}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </FormField>
              )}
            />

            <Controller
              name='birthDate'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Data de nascimento'
                  error={fieldState.error?.message}
                >
                  <DateInput
                    value={field.value ?? undefined}
                    onChange={(date) => field.onChange(date ?? null)}
                    minDate={new Date(1940, 0, 1)}
                    maxDate={new Date()}
                    defaultMonth={new Date(2000, 0)}
                    invalid={fieldState.invalid}
                    ariaLabel='Data de nascimento'
                  />
                </FormField>
              )}
            />

            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Email'
                  htmlFor='email'
                  error={fieldState.error?.message}
                >
                  <Input
                    id='email'
                    type='email'
                    placeholder='email@exemplo.com'
                    className={formInputClassName}
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </FormField>
              )}
            />

            <Controller
              name='phone'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Telefone'
                  htmlFor='phone'
                  error={fieldState.error?.message}
                >
                  <Input
                    id='phone'
                    inputMode='numeric'
                    maxLength={15}
                    placeholder='(85) 99999-9999'
                    className={cn(formInputClassName, 'max-w-none')}
                    aria-invalid={fieldState.invalid}
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(formatPhone(event.target.value));
                    }}
                  />
                </FormField>
              )}
            />

            <Controller
              name='gender'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField label='Sexo' error={fieldState.error?.message}>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={formSelectTriggerClassName}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione' />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName}>
                      <SelectItem value='male'>Masculino</SelectItem>
                      <SelectItem value='female'>Feminino</SelectItem>
                      <SelectItem value='other'>Outro</SelectItem>
                      <SelectItem value='prefer-not-to-say'>
                        Prefiro não informar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              name='status'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Status inicial'
                  error={fieldState.error?.message}
                >
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={formSelectTriggerClassName}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione' />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName}>
                      <SelectItem value='lead'>Lead</SelectItem>
                      <SelectItem value='trial'>Experimental</SelectItem>
                      <SelectItem value='active'>Ativo</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />
          </CardContent>
        </Card>

        <Card className={formCardClassName}>
          <CardHeader className={formCardHeaderClassName}>
            <CardTitle className='text-lg font-semibold'>
              Informações de treino
            </CardTitle>
          </CardHeader>

          <CardContent className={cn(formCardContentClassName, formGridClassName)}>
            <Controller
              name='beltId'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Faixa inicial'
                  error={fieldState.error?.message}
                >
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={formSelectTriggerClassName}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione a faixa' />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName}>
                      {belts.map((belt) => (
                        <SelectItem key={belt.id} value={belt.id}>
                          {belt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              name='mainClassId'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Turma principal'
                  error={fieldState.error?.message}
                >
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={formSelectTriggerClassName}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione a turma' />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName}>
                      {classes.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              name='studentHistoryType'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Histórico do aluno'
                  error={fieldState.error?.message}
                >
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={formSelectTriggerClassName}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione o tipo' />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName}>
                      <SelectItem value='new'>Aluno novo</SelectItem>
                      <SelectItem value='existing'>
                        Aluno antigo / graduado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              name='progressionStartDate'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Data base de progresso'
                  hint={
                    studentHistoryType === 'existing'
                      ? 'Informe a data da última graduação para liberar o retroativo da faixa atual.'
                      : 'Informe a data em que o aluno iniciou na faixa atual.'
                  }
                  error={fieldState.error?.message}
                >
                  <DateInput
                    value={field.value ?? undefined}
                    onChange={(date) => field.onChange(date ?? null)}
                    minDate={new Date(1940, 0, 1)}
                    maxDate={new Date()}
                    defaultMonth={new Date()}
                    invalid={fieldState.invalid}
                    ariaLabel='Data base de progresso'
                  />
                </FormField>
              )}
            />

            <Controller
              name='billingDueDay'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Dia de vencimento da mensalidade'
                  hint='Dia do mês em que a mensalidade vence. Máximo 28 para cobrir todos os meses.'
                  error={fieldState.error?.message}
                >
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ''}
                  >
                    <SelectTrigger
                      className={formSelectTriggerClassName}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione o dia' />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName}>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <SelectItem key={day} value={String(day)}>
                            Dia {day}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              name='planId'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Plano de mensalidade'
                  hint='Opcional. Se selecionado, a primeira fatura será gerada automaticamente.'
                  error={fieldState.error?.message}
                >
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={formSelectTriggerClassName}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione um plano (opcional)' />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName}>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} —{' '}
                          {(plan.priceInCents / 100).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              name='goal'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Objetivo principal'
                  error={fieldState.error?.message}
                >
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={formSelectTriggerClassName}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione o objetivo' />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName}>
                      <SelectItem value='health'>Saúde</SelectItem>
                      <SelectItem value='self-defense'>
                        Defesa pessoal
                      </SelectItem>
                      <SelectItem value='competition'>Competição</SelectItem>
                      <SelectItem value='hobby'>Hobby</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              name='leadSourceId'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Origem do aluno'
                  error={fieldState.error?.message}
                >
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className={formSelectTriggerClassName}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione a origem' />
                    </SelectTrigger>
                    <SelectContent className={formSelectContentClassName}>
                      {leadSources.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
            />

            <Controller
              name='notes'
              control={form.control}
              render={({ field, fieldState }) => (
                <FormField
                  label='Observações'
                  htmlFor='notes'
                  hint='Campo opcional para contexto adicional do aluno.'
                  error={fieldState.error?.message}
                  className='md:col-span-2'
                >
                  <Textarea
                    id='notes'
                    placeholder='Adicione observações importantes sobre o aluno'
                    className='min-h-28 border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                </FormField>
              )}
            />
          </CardContent>
        </Card>

        <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
            disabled={isPending}
            onClick={() => router.push('/admin/alunos')}
          >
            Cancelar
          </Button>

          <Button
            type='submit'
            className='bg-red-600 text-white hover:bg-red-500'
            disabled={isPending}
          >
            {isPending ? 'Salvando...' : 'Salvar aluno'}
          </Button>
        </div>
      </form>
    </div>
  );
};
