import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome do plano deve ter pelo menos 2 caracteres.')
    .max(60, 'O nome do plano deve ter no máximo 60 caracteres.'),

  description: z
    .string()
    .max(200, 'A descrição deve ter no máximo 200 caracteres.')
    .optional(),

  priceInCents: z
    .number({ error: 'Digite um valor válido.' })
    .int('O valor deve ser um número inteiro em centavos.')
    .min(100, 'O valor mínimo é R$ 1,00.'),

  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'SEMIANNUAL', 'ANNUAL'], {
    error: 'Selecione a periodicidade.',
  }),
});

export type CreatePlanSchema = z.infer<typeof createPlanSchema>;
