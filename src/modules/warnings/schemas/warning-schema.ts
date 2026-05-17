import { z } from 'zod';

export const warningSchema = z.object({
  title: z
    .string()
    .min(3, 'O título deve ter ao menos 3 caracteres.')
    .max(120, 'Título muito longo.'),

  content: z
    .string()
    .min(10, 'O conteúdo deve ter ao menos 10 caracteres.')
    .max(5000, 'Conteúdo muito longo.'),

  type: z.enum(['info', 'aviso', 'importante']),

  visibility: z.enum(['todos', 'alunos', 'professores']),

  publishNow: z.boolean(),

  publishedAt: z.string().optional(),

  expiresAt: z.string().optional(),
});

export type WarningInput = z.infer<typeof warningSchema>;
