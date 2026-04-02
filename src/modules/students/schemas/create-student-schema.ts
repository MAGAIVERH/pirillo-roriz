import { z } from 'zod';

export const createStudentSchema = z.object({
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
  belt: z.string().min(1, 'Selecione a faixa inicial.'),
  mainClass: z.string().min(1, 'Selecione a turma principal.'),
  goal: z.string().min(1, 'Selecione o objetivo principal.'),
  leadSource: z.string().min(1, 'Selecione a origem do aluno.'),
  notes: z.string().optional(),
});

export type CreateStudentSchema = z.infer<typeof createStudentSchema>;
