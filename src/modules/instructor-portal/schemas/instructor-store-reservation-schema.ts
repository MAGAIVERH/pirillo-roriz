import { z } from 'zod';

export const instructorStoreReservationSchema = z.object({
  productId: z.string().min(1, 'Produto inválido.'),
  quantity: z.number().int().min(1, 'Quantidade mínima: 1.').max(10).optional(),
});

export type InstructorStoreReservationInput = z.infer<
  typeof instructorStoreReservationSchema
>;
