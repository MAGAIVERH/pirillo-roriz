import { z } from 'zod';

export const createStudentSchema = z
  .object({
    fullName: z
      .string()
      .min(3, 'O nome completo deve ter pelo menos 3 caracteres.'),
    preferredName: z.string().optional(),
    birthDate: z.date({
      error: 'Selecione a data de nascimento.',
    }),
    email: z.string().email('Digite um email válido.'),
    phone: z.string().refine(
      (value) => {
        const digits = value.replace(/\D/g, '');
        return digits.length === 10 || digits.length === 11;
      },
      {
        message: 'Digite um telefone válido.',
      },
    ),
    gender: z.string().min(1, 'Selecione o sexo.'),
    status: z.string().min(1, 'Selecione o status inicial.'),
    beltId: z.string().min(1, 'Selecione a faixa inicial.'),
    mainClassId: z.string().min(1, 'Selecione a turma principal.'),
    goal: z.string().min(1, 'Selecione o objetivo principal.'),
    leadSourceId: z.string().min(1, 'Selecione a origem do aluno.'),
    studentHistoryType: z.enum(['new', 'existing'], {
      error: 'Selecione se o aluno é novo ou antigo.',
    }),
    progressionStartDate: z.date({
      error: 'Selecione a data de início ou da última graduação.',
    }),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const selectedStart = new Date(
      data.progressionStartDate.getFullYear(),
      data.progressionStartDate.getMonth(),
      data.progressionStartDate.getDate(),
    );

    if (selectedStart > todayStart) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['progressionStartDate'],
        message: 'A data não pode estar no futuro.',
      });
    }
  });

export type CreateStudentSchema = z.infer<typeof createStudentSchema>;
