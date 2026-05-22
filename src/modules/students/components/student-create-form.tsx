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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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

  // Pré-preenche o dia de vencimento quando a data base muda
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
    <div className='space-y-6'>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className='space-y-6'
      >
        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-xl'>Dados principais</CardTitle>
          </CardHeader>

          <CardContent className='grid gap-4 md:grid-cols-2'>
            <Controller
              name='fullName'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='fullName'>Nome completo</Label>
                  <Input
                    id='fullName'
                    placeholder='Digite o nome completo do aluno'
                    className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='preferredName'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label htmlFor='preferredName'>Nome preferido</Label>
                  <Input
                    id='preferredName'
                    placeholder='Como prefere ser chamado'
                    className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='birthDate'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label>Data de nascimento</Label>

                  <DateInput
                    value={field.value ?? undefined}
                    onChange={(date) => field.onChange(date ?? null)}
                    minDate={new Date(1940, 0, 1)}
                    maxDate={new Date()}
                    defaultMonth={new Date(2000, 0)}
                    invalid={fieldState.invalid}
                    ariaLabel='Data de nascimento'
                  />

                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='email'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    placeholder='email@exemplo.com'
                    className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='phone'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label htmlFor='phone'>Telefone</Label>
                  <Input
                    id='phone'
                    inputMode='numeric'
                    maxLength={15}
                    placeholder='(85) 99999-9999'
                    className='border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
                    aria-invalid={fieldState.invalid}
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(formatPhone(event.target.value));
                    }}
                  />
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='gender'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label>Sexo</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className='border-white/10 bg-zinc-900 text-white'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                      <SelectItem value='male'>Masculino</SelectItem>
                      <SelectItem value='female'>Feminino</SelectItem>
                      <SelectItem value='other'>Outro</SelectItem>
                      <SelectItem value='prefer-not-to-say'>
                        Prefiro não informar
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='status'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label>Status inicial</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className='border-white/10 bg-zinc-900 text-white'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                      <SelectItem value='lead'>Lead</SelectItem>
                      <SelectItem value='trial'>Experimental</SelectItem>
                      <SelectItem value='active'>Ativo</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-xl'>Informações de treino</CardTitle>
          </CardHeader>

          <CardContent className='grid gap-4 md:grid-cols-2'>
            <Controller
              name='beltId'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label>Faixa inicial</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className='border-white/10 bg-zinc-900 text-white'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione a faixa' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                      {belts.map((belt) => (
                        <SelectItem key={belt.id} value={belt.id}>
                          {belt.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='mainClassId'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label>Turma principal</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className='border-white/10 bg-zinc-900 text-white'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione a turma' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                      {classes.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='studentHistoryType'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label>Histórico do aluno</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className='border-white/10 bg-zinc-900 text-white'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione o tipo' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                      <SelectItem value='new'>Aluno novo</SelectItem>
                      <SelectItem value='existing'>
                        Aluno antigo / graduado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='progressionStartDate'
              control={form.control}
              render={({ field, fieldState }) => {
                return (
                  <div className='space-y-2'>
                    <Label>
                      {studentHistoryType === 'existing'
                        ? 'Data da última graduação'
                        : 'Data de início'}
                    </Label>

                    <DateInput
                      value={field.value ?? undefined}
                      onChange={(date) => field.onChange(date ?? null)}
                      minDate={new Date(1940, 0, 1)}
                      maxDate={new Date()}
                      defaultMonth={new Date()}
                      invalid={fieldState.invalid}
                      ariaLabel={
                        studentHistoryType === 'existing'
                          ? 'Data da última graduação'
                          : 'Data de início'
                      }
                    />

                    <p className='text-sm text-zinc-500'>
                      {studentHistoryType === 'existing'
                        ? 'Use a data da última graduação para liberar o retroativo da faixa atual.'
                        : 'Use a data em que o aluno iniciou na faixa atual.'}
                    </p>

                    {fieldState.error ? (
                      <p className='text-sm text-red-400'>
                        {fieldState.error.message}
                      </p>
                    ) : null}
                  </div>
                );
              }}
            />

            <Controller
              name='billingDueDay'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label htmlFor='billingDueDay'>
                    Dia de vencimento da mensalidade
                  </Label>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : ''}
                  >
                    <SelectTrigger
                      className='border-white/10 bg-zinc-900 text-white'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione o dia' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <SelectItem key={day} value={String(day)}>
                            Dia {day}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <p className='text-sm text-zinc-500'>
                    Dia do mês em que a mensalidade vence. Máximo 28 para cobrir
                    todos os meses.
                  </p>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='planId'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label>Plano de mensalidade</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className='border-white/10 bg-zinc-900 text-white'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione um plano (opcional)' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
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
                  <p className='text-sm text-zinc-500'>
                    Opcional. Se selecionado, a primeira fatura será gerada
                    automaticamente.
                  </p>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='goal'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label>Objetivo principal</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className='border-white/10 bg-zinc-900 text-white'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione o objetivo' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                      <SelectItem value='health'>Saúde</SelectItem>
                      <SelectItem value='self-defense'>
                        Defesa pessoal
                      </SelectItem>
                      <SelectItem value='competition'>Competição</SelectItem>
                      <SelectItem value='hobby'>Hobby</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='leadSourceId'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2'>
                  <Label>Origem do aluno</Label>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      className='border-white/10 bg-zinc-900 text-white'
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder='Selecione a origem' />
                    </SelectTrigger>
                    <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                      {leadSources.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
              )}
            />

            <Controller
              name='notes'
              control={form.control}
              render={({ field, fieldState }) => (
                <div className='space-y-2 md:col-span-2'>
                  <Label htmlFor='notes'>Observações</Label>
                  <Textarea
                    id='notes'
                    placeholder='Adicione observações importantes sobre o aluno'
                    className='min-h-32 border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
                    aria-invalid={fieldState.invalid}
                    {...field}
                  />
                  <p className='text-sm text-zinc-500'>
                    Campo opcional para contexto adicional do aluno.
                  </p>
                  {fieldState.error ? (
                    <p className='text-sm text-red-400'>
                      {fieldState.error.message}
                    </p>
                  ) : null}
                </div>
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
            onClick={() => {
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
            }}
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
