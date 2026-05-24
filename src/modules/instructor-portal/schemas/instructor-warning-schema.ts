import { z } from 'zod';

export const instructorWarningSchema = z
  .object({
    title: z
      .string()
      .min(3, 'O título deve ter ao menos 3 caracteres.')
      .max(120, 'Título muito longo.'),
    content: z
      .string()
      .min(10, 'O conteúdo deve ter ao menos 10 caracteres.')
      .max(5000, 'Conteúdo muito longo.'),
    type: z.enum(['info', 'aviso', 'importante']),
    audience: z.enum(['all_my_students', 'class']),
    classId: z.string().optional(),
    expiresAt: z.string().optional(),
  })
  .superRefine((data, context) => {
    if (data.audience === 'class' && !data.classId?.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione a turma para enviar o aviso.',
        path: ['classId'],
      });
    }
  });

export type InstructorWarningInput = z.infer<typeof instructorWarningSchema>;
