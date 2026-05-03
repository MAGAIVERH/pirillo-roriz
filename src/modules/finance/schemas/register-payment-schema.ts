import { z } from 'zod';

export const registerPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Fatura inválida.'),
  amountInCents: z
    .number({ error: 'Digite um valor válido.' })
    .int()
    .min(1, 'O valor mínimo é R$ 0,01.'),
  method: z.enum(['CASH', 'PIX', 'CARD', 'BANK_TRANSFER'], {
    error: 'Selecione a forma de pagamento.',
  }),
  notes: z.string().optional(),
});

export type RegisterPaymentSchema = z.infer<typeof registerPaymentSchema>;
