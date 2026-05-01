import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type StudentFinanceSummary = {
  hasSubscription: boolean;
  planName: string | null;
  priceLabel: string | null;
  billingDueDay: number | null;
  // Fatura do mês atual
  currentInvoice: {
    id: string;
    status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELED' | 'REFUNDED';
    statusLabel: string;
    amountLabel: string;
    dueDate: string;
    paidAt: string | null;
  } | null;
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

const statusLabelMap: Record<string, string> = {
  PAID: 'Pago',
  PENDING: 'Pendente',
  OVERDUE: 'Vencido',
  CANCELED: 'Cancelado',
  REFUNDED: 'Estornado',
};

export async function getStudentFinanceSummary(
  studentId: string,
): Promise<StudentFinanceSummary> {
  const academy = await getOrCreateDefaultAcademy();

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  // Busca assinatura ativa e fatura do mês em paralelo
  const [subscription, currentInvoice] = await Promise.all([
    db.studentSubscription.findFirst({
      where: {
        studentId,
        status: 'ACTIVE',
        student: { academyId: academy.id },
      },
      include: { plan: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.invoice.findFirst({
      where: {
        studentId,
        academyId: academy.id,
        status: { notIn: ['CANCELED', 'REFUNDED'] },
        dueDate: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { dueDate: 'asc' },
    }),
  ]);

  return {
    hasSubscription: !!subscription,
    planName: subscription?.plan?.name ?? null,
    priceLabel: subscription
      ? formatCurrency(subscription.priceInCents - subscription.discountInCents)
      : null,
    billingDueDay: subscription?.billingDueDay ?? null,
    currentInvoice: currentInvoice
      ? {
          id: currentInvoice.id,
          status: currentInvoice.status,
          statusLabel:
            statusLabelMap[currentInvoice.status] ?? currentInvoice.status,
          amountLabel: formatCurrency(
            currentInvoice.amountInCents - currentInvoice.discountInCents,
          ),
          dueDate: currentInvoice.dueDate.toLocaleDateString('pt-BR'),
          paidAt: currentInvoice.paidAt
            ? currentInvoice.paidAt.toLocaleDateString('pt-BR')
            : null,
        }
      : null,
  };
}
