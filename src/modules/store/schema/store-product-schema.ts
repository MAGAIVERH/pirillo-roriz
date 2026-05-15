import { z } from 'zod';

export const storeProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres.')
    .max(100, 'Nome muito longo.'),

  description: z.string().max(500).optional(),

  // valor em centavos — o form converte antes de enviar
  priceCents: z
    .number({ invalid_type_error: 'Informe um valor válido.' })
    .min(1, 'Valor deve ser maior que zero.'),

  qty: z
    .number({ invalid_type_error: 'Informe uma quantidade válida.' })
    .int()
    .min(0, 'Quantidade não pode ser negativa.'),

  imageUrl: z.string().url().optional().or(z.literal('')),

  visibility: z.enum(['todos', 'alunos', 'professores']),
});

export type StoreProductInput = z.infer<typeof storeProductSchema>;
