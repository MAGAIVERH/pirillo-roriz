import { z } from 'zod';

export const createInstructorSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(3, 'O nome completo deve ter pelo menos 3 caracteres.'),
  birthDate: z.string().min(1, 'Selecione a data de nascimento.'),
  email: z.string().trim().email('Digite um email válido.'),
  phone: z
    .string()
    .trim()
    .min(10, 'Digite um telefone válido.')
    .max(20, 'Digite um telefone válido.'),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    error: 'Selecione o status do professor.',
  }),
  belt: z.string().trim().min(1, 'Selecione a faixa do professor.'),
  beltDegree: z
    .string()
    .optional()
    .refine((value) => {
      if (!value || !value.trim()) {
        return true;
      }

      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6;
    }, 'O grau deve ser um número entre 0 e 6.'),
  notes: z.string().optional(),
});

export type CreateInstructorFormData = z.infer<typeof createInstructorSchema>;
