import { z } from 'zod';

import { STUDENT_STATUSES } from '../types/student-status';

export const updateStudentStatusSchema = z
  .object({
    studentId: z.string().min(1, 'Aluno inválido.'),
    toStatus: z.enum(STUDENT_STATUSES, {
      error: 'Selecione um status válido.',
    }),
    reasonId: z.string().optional(),
    notes: z.string().max(500, 'Observação muito longa.').optional(),
  })
  .refine(
    (data) => data.toStatus !== 'CANCELED' || Boolean(data.reasonId),
    {
      message: 'Para cancelar é obrigatório informar o motivo.',
      path: ['reasonId'],
    },
  );

export type UpdateStudentStatusInput = z.infer<typeof updateStudentStatusSchema>;
