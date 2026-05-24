import { z } from 'zod';

export const processQrCheckInSchema = z.object({
  sessionId: z.string().min(1, 'Selecione a aula.'),
  qrPayload: z.string().min(8, 'QR Code inválido.'),
});

export type ProcessQrCheckInInput = z.infer<typeof processQrCheckInSchema>;
