import { z } from 'zod';

export const storeProductSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres.')
    .max(100, 'Nome muito longo.'),

  description: z.string().max(500).optional(),

  priceCents: z
    .number({ error: 'Informe um valor válido.' })
    .min(1, 'Valor deve ser maior que zero.'),

  stockQuantity: z
    .number({ error: 'Informe uma quantidade válida.' })
    .int()
    .min(0, 'Quantidade não pode ser negativa.'),

  imageUrl: z.string().max(2_000_000).optional().or(z.literal('')),

  imageUrls: z
    .array(z.string().max(2_000_000))
    .max(10, 'Máximo de 10 fotos por produto.')
    .optional(),

  visibility: z.enum(['todos', 'alunos', 'professores']),
});

export type StoreProductInput = z.infer<typeof storeProductSchema>;
