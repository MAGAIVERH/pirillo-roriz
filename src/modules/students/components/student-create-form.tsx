'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  createStudentSchema,
  type CreateStudentSchema,
} from '@/modules/students/schemas/create-student-schema';

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

export const StudentCreateForm = () => {
  const [submittedData, setSubmittedData] =
    useState<CreateStudentSchema | null>(null);

  const form = useForm<CreateStudentSchema>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: {
      fullName: '',
      preferredName: '',
      email: '',
      phone: '',
      gender: '',
      status: '',
      belt: '',
      mainClass: '',
      goal: '',
      leadSource: '',
      notes: '',
    },
  });

  const onSubmit = (values: CreateStudentSchema) => {
    console.log('create student form values', values);
    setSubmittedData(values);
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

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type='button'
                        variant='outline'
                        className={cn(
                          'h-10 w-full justify-between border-white/10 bg-zinc-900 text-left font-normal text-white hover:bg-zinc-800 hover:text-white',
                          !field.value && 'text-zinc-500',
                        )}
                        aria-invalid={fieldState.invalid}
                      >
                        {field.value ? (
                          format(field.value, 'dd/MM/yyyy', {
                            locale: ptBR,
                          })
                        ) : (
                          <span>dd/mm/aaaa</span>
                        )}

                        <CalendarIcon className='h-4 w-4 text-white' />
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent
                      align='start'
                      className='z-50 w-auto border-white/10 bg-zinc-950 p-0 text-white'
                    >
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={ptBR}
                        captionLayout='dropdown'
                        startMonth={new Date(1940, 0)}
                        endMonth={new Date()}
                        defaultMonth={field.value ?? new Date(2000, 0)}
                        initialFocus
                        className='rounded-md bg-zinc-950 text-white'
                      />
                    </PopoverContent>
                  </Popover>

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
              name='belt'
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
                      <SelectItem value='white'>Branca</SelectItem>
                      <SelectItem value='blue'>Azul</SelectItem>
                      <SelectItem value='purple'>Roxa</SelectItem>
                      <SelectItem value='brown'>Marrom</SelectItem>
                      <SelectItem value='black'>Preta</SelectItem>
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
              name='mainClass'
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
                      <SelectItem value='adulto-iniciante'>
                        Jiu-Jitsu Adulto Iniciante
                      </SelectItem>
                      <SelectItem value='kids'>Jiu-Jitsu Kids</SelectItem>
                      <SelectItem value='nogi'>Jiu-Jitsu No-Gi</SelectItem>
                      <SelectItem value='competicao'>
                        Jiu-Jitsu Competição
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
              name='leadSource'
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
                      <SelectItem value='instagram'>Instagram</SelectItem>
                      <SelectItem value='indication'>Indicação</SelectItem>
                      <SelectItem value='whatsapp'>WhatsApp</SelectItem>
                      <SelectItem value='street'>Passagem em frente</SelectItem>
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
          >
            Cancelar
          </Button>

          <Button
            type='submit'
            className='bg-red-600 text-white hover:bg-red-500'
          >
            Salvar aluno
          </Button>
        </div>
      </form>

      {submittedData ? (
        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-xl'>Dados enviados no teste</CardTitle>
          </CardHeader>

          <CardContent>
            <pre className='overflow-x-auto rounded-xl border border-white/10 bg-zinc-900 p-4 text-xs text-zinc-300'>
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
