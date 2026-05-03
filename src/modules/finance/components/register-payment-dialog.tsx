'use client';

import { useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Controller, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  registerPaymentSchema,
  type RegisterPaymentSchema,
} from '@/modules/finance/schemas/register-payment-schema';
import { registerPaymentAction } from '@/modules/finance/actions/register-payment';

type RegisterPaymentDialogProps = {
  invoiceId: string;
  amountInCents: number;
  studentName: string;
  dueDate: string;
  trigger?: React.ReactNode;
};

export const RegisterPaymentDialog = ({
  invoiceId,
  amountInCents,
  studentName,
  dueDate,
  trigger,
}: RegisterPaymentDialogProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Formata centavos → "120,00" para exibir no input
  const defaultValueDisplay = (amountInCents / 100)
    .toFixed(2)
    .replace('.', ',');

  const form = useForm<RegisterPaymentSchema>({
    resolver: zodResolver(registerPaymentSchema),
    defaultValues: {
      invoiceId,
      amountInCents,
      method: undefined,
      notes: '',
    },
  });

  const onSubmit = (values: RegisterPaymentSchema) => {
    startTransition(async () => {
      const result = await registerPaymentAction(values);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      form.reset();
      router.refresh();
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className='bg-red-600 text-white hover:bg-red-500'>
            Registrar pagamento
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className='border-white/10 bg-zinc-950 text-white sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='text-xl'>Registrar pagamento</DialogTitle>
          <DialogDescription className='text-zinc-400'>
            Confirme o pagamento de{' '}
            <strong className='text-white'>{studentName}</strong> referente ao
            vencimento de {dueDate}.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
          className='space-y-4 pt-2'
        >
          {/* Valor — input simples, admin digita ex: 120,00 */}
          <Controller
            name='amountInCents'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2'>
                <Label htmlFor='amount'>Valor recebido (R$)</Label>
                <div className='relative'>
                  <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400'>
                    R$
                  </span>
                  <Input
                    id='amount'
                    placeholder={defaultValueDisplay}
                    className='border-white/10 bg-zinc-900 pl-9 text-white placeholder:text-zinc-500'
                    aria-invalid={fieldState.invalid}
                    defaultValue={defaultValueDisplay}
                    onChange={(e) => {
                      // Converte "120,00" ou "120.00" para centavos
                      const raw = e.target.value
                        .replace(/\./g, '')
                        .replace(',', '.');
                      const parsed = parseFloat(raw);
                      field.onChange(
                        isNaN(parsed) ? 0 : Math.round(parsed * 100),
                      );
                    }}
                  />
                </div>
                <p className='text-sm text-zinc-500'>
                  Valor pré-preenchido com o total da fatura. Altere se
                  necessário.
                </p>
                {fieldState.error ? (
                  <p className='text-sm text-red-400'>
                    {fieldState.error.message}
                  </p>
                ) : null}
              </div>
            )}
          />

          {/* Forma de pagamento */}
          <Controller
            name='method'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2'>
                <Label>Forma de pagamento</Label>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    className='border-white/10 bg-zinc-900 text-white'
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder='Selecione' />
                  </SelectTrigger>
                  <SelectContent className='z-50 border-white/10 bg-zinc-950 text-white'>
                    <SelectItem value='PIX'>PIX</SelectItem>
                    <SelectItem value='CASH'>Dinheiro</SelectItem>
                    <SelectItem value='CARD'>Cartão</SelectItem>
                    <SelectItem value='BANK_TRANSFER'>
                      Transferência bancária
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

          {/* Observações */}
          <Controller
            name='notes'
            control={form.control}
            render={({ field, fieldState }) => (
              <div className='space-y-2'>
                <Label>Observações</Label>
                <Textarea
                  placeholder='Ex: comprovante de PIX enviado pelo WhatsApp (opcional)'
                  className='min-h-20 border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500'
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

          <div className='flex justify-end gap-3 pt-2'>
            <Button
              type='submit'
              className='bg-red-600 text-white hover:bg-red-500'
              disabled={isPending}
            >
              {isPending ? 'Salvando...' : 'Confirmar pagamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
