'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  createPlanSchema,
  type CreatePlanSchema,
} from '@/modules/finance/schemas/plan-schema';

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

/**
 * Converte o valor digitado (ex: "180,00" ou "180.00") para centavos inteiros.
 * Aceita vírgula ou ponto como separador decimal.
 */
function parseCurrencyToCents(raw: string): number {
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

/**
 * Formata centavos para exibição no campo (ex: 18000 → "180,00").
 */
function formatCentsToDisplay(cents: number): string {
  if (cents === 0) return '';
  return (cents / 100).toFixed(2).replace('.', ',');
}

// -------------------------------------------------------
// Props
// -------------------------------------------------------

type PlanCreateFormProps = {
  onSubmitAction: (values: CreatePlanSchema) => Promise<{
    success: boolean;
    message: string;
  }>;
};

// -------------------------------------------------------
// Componente
// -------------------------------------------------------

export const PlanCreateForm = ({ onSubmitAction }: PlanCreateFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreatePlanSchema>({
    resolver: zodResolver(createPlanSchema),
    defaultValues: {
      name: '',
      description: '',
      priceInCents: 0,
      billingCycle: undefined,
    },
  });

  const onSubmit = (values: CreatePlanSchema) => {
    startTransition(async () => {
      const result = await onSubmitAction(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setTimeout(() => {
        router.push('/admin/financeiro/planos');
        router.refresh();
      }, 400);
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
      className='space-y-6'
    >
      <Card className='border-white/10 bg-zinc-950 text-white'>
        <CardHeader>
          <CardTitle className='text-xl'>Dados do plano</CardTitle>
        </CardHeader>

        <CardContent className='grid gap-4 md:grid-cols-2'>
          {/* Nome */}
          <Controller
            name='name'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='name'>Nome do plano</Label>
                <Input
                  id='name'
                  placeholder='Ex: Plano Adulto, Plano Kids, Plano Competição'
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

          {/* Valor */}
          <Controller
            name='priceInCents'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2'>
                <Label htmlFor='priceInCents'>Valor (R$)</Label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400'>
                    R$
                  </span>
                  <Input
                    id='priceInCents'
                    inputMode='decimal'
                    placeholder='0,00'
                    className='border-white/10 bg-zinc-900 pl-9 text-white placeholder:text-zinc-500'
                    aria-invalid={fieldState.invalid}
                    // Exibe o valor formatado, mas armazena em centavos
                    value={field.value ? formatCentsToDisplay(field.value) : ''}
                    onChange={(e) => {
                      field.onChange(parseCurrencyToCents(e.target.value));
                    }}
                  />
                </div>
                <p className='text-sm text-zinc-500'>
                  Digite o valor mensal do plano. Ex: 180,00
                </p>
                {fieldState.error ? (
                  <p className='text-sm text-red-400'>
                    {fieldState.error.message}
                  </p>
                ) : null}
              </div>
            )}
          />

          {/* Periodicidade */}
          <Controller
            name='billingCycle'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2'>
                <Label>Periodicidade</Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className='border-white/10 bg-zinc-900 text-white'
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder='Selecione' />
                  </SelectTrigger>
                  <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                    <SelectItem value='MONTHLY'>Mensal</SelectItem>
                    <SelectItem value='QUARTERLY'>Trimestral</SelectItem>
                    <SelectItem value='SEMIANNUAL'>Semestral</SelectItem>
                    <SelectItem value='ANNUAL'>Anual</SelectItem>
                  </SelectContent>
                </Select>
                <p className='text-sm text-zinc-500'>
                  Com que frequência o aluno é cobrado.
                </p>
                {fieldState.error ? (
                  <p className='text-sm text-red-400'>
                    {fieldState.error.message}
                  </p>
                ) : null}
              </div>
            )}
          />

          {/* Descrição */}
          <Controller
            name='description'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2 md:col-span-2'>
                <Label htmlFor='description'>Descrição</Label>
                <Textarea
                  id='description'
                  placeholder='Descreva o que está incluso no plano (opcional)'
                  className='min-h-24 border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
                <p className='text-sm text-zinc-500'>
                  Campo opcional. Aparece na listagem de planos para orientar o
                  admin.
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

      {/* Ações */}
      <div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
        <Button
          type='button'
          variant='outline'
          className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
          disabled={isPending}
          onClick={() => router.push('/admin/financeiro/planos')}
        >
          Cancelar
        </Button>

        <Button
          type='submit'
          className='bg-red-600 text-white hover:bg-red-500'
          disabled={isPending}
        >
          {isPending ? 'Salvando...' : 'Salvar plano'}
        </Button>
      </div>
    </form>
  );
};
