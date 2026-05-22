'use server';

import { revalidatePath } from 'next/cache';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import {
  registerPaymentSchema,
  type RegisterPaymentSchema,
} from '@/modules/finance/schemas/register-payment-schema';
import { syncStudentDelinquencyStatus } from '@/modules/students/actions/sync-student-delinquency';

export const registerPaymentAction = async (
  input: RegisterPaymentSchema,
): Promise<{ success: boolean; message: string }> => {
  const parsed = registerPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    // Verifica se a fatura existe e pertence à academia
    const invoice = await db.invoice.findFirst({
      where: {
        id: parsed.data.invoiceId,
        academyId: academy.id,
        status: { notIn: ['PAID', 'CANCELED', 'REFUNDED'] },
      },
      select: {
        id: true,
        amountInCents: true,
        discountInCents: true,
        fineInCents: true,
        studentId: true,
      },
    });

    if (!invoice) {
      return {
        success: false,
        message: 'Fatura não encontrada ou já foi paga.',
      };
    }

    const now = new Date();

    await db.$transaction(async (tx) => {
      // 1. Registra o pagamento
      await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amountInCents: parsed.data.amountInCents,
          method: parsed.data.method,
          paidAt: now,
          notes: parsed.data.notes?.trim() || null,
        },
      });

      // 2. Verifica total pago até agora
      const payments = await tx.payment.findMany({
        where: { invoiceId: invoice.id },
        select: { amountInCents: true },
      });

      const totalPaid = payments.reduce((sum, p) => sum + p.amountInCents, 0);
      const netAmount =
        invoice.amountInCents - invoice.discountInCents + invoice.fineInCents;

      // 3. Se pagou tudo, marca como PAID
      if (totalPaid >= netAmount) {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: 'PAID',
            paidAt: now,
          },
        });
      }
    });

    await syncStudentDelinquencyStatus(invoice.studentId);

    revalidatePath(`/admin/alunos/${invoice.studentId}`);
    revalidatePath('/admin/financeiro');

    return {
      success: true,
      message: 'Pagamento registrado com sucesso.',
    };
  } catch (error) {
    console.error('registerPaymentAction error', error);

    return {
      success: false,
      message: 'Não foi possível registrar o pagamento.',
    };
  }
};
