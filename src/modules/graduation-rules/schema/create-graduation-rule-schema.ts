import { z } from 'zod';

export const createGraduationRuleSchema = z
  .object({
    program: z.enum(['KIDS', 'ADULT'], {
      error: 'Selecione o programa.',
    }),
    currentBeltId: z.string().min(1, 'Selecione a faixa atual.'),
    currentDegreeId: z.string().optional(),
    nextBeltId: z.string().min(1, 'Selecione a próxima faixa.'),
    nextDegreeId: z.string().optional(),
    minimumMonths: z
      .string()
      .min(1, 'Informe o tempo mínimo em meses.')
      .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, {
        message: 'O tempo mínimo deve ser um número inteiro maior que 0.',
      }),
    minimumAge: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE'], {
      error: 'Selecione o status da regra.',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.program === 'KIDS') {
      if (!data.minimumAge?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['minimumAge'],
          message: 'Informe a idade mínima para regras infantis.',
        });
        return;
      }

      if (
        !Number.isInteger(Number(data.minimumAge)) ||
        Number(data.minimumAge) < 0
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['minimumAge'],
          message:
            'A idade mínima deve ser um número inteiro maior ou igual a 0.',
        });
      }
    }
  });

export type CreateGraduationRuleFormData = z.infer<
  typeof createGraduationRuleSchema
>;
