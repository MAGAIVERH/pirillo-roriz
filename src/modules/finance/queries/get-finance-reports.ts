import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

// -------------------------------------------------------
// Tipos
// -------------------------------------------------------

export type FinanceReportSummary = {
  revenueRealizedLabel: string;
  revenueRealizedCents: number;
  revenueProjectedLabel: string;
  revenueProjectedCents: number;
  adimplencyRate: number;
  adimplencyLabel: string;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
};

export type FinanceMonthlyData = {
  month: string;
  monthFull: string;
  realized: number;
  projected: number;
  realizedLabel: string;
  projectedLabel: string;
};

export type FinanceReportPaymentRow = {
  paymentId: string;
  studentName: string;
  planName: string;
  amountLabel: string;
  amountCents: number;
  method: string;
  methodLabel: string;
  paidAt: string;
};

export type FinanceReportByPlan = {
  planName: string;
  totalInvoices: number;
  paidInvoices: number;
  revenueLabel: string;
  revenueCents: number;
  adimplencyRate: number;
};

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

const MONTH_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const MONTH_FULL = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const METHOD_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CASH: 'Dinheiro',
  CARD: 'Cartão',
  BANK_TRANSFER: 'Transferência',
};

// -------------------------------------------------------
// Resumo do mês
// -------------------------------------------------------

export async function getFinanceReportSummary(
  year: number,
  month: number,
): Promise<FinanceReportSummary> {
  const academy = await getOrCreateDefaultAcademy();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);

  const invoices = await db.invoice.findMany({
    where: {
      academyId: academy.id,
      status: { notIn: ['CANCELED', 'REFUNDED'] },
      dueDate: { gte: from, lte: to },
    },
    select: {
      status: true,
      amountInCents: true,
      discountInCents: true,
      payments: { select: { amountInCents: true } },
    },
  });

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === 'PAID').length;
  const pendingInvoices = invoices.filter((i) => i.status === 'PENDING').length;
  const overdueInvoices = invoices.filter((i) => i.status === 'OVERDUE').length;

  const revenueRealizedCents = invoices
    .filter((i) => i.status === 'PAID')
    .reduce(
      (sum, i) => sum + i.payments.reduce((s, p) => s + p.amountInCents, 0),
      0,
    );

  const revenueProjectedCents = invoices.reduce(
    (sum, i) => sum + i.amountInCents - i.discountInCents,
    0,
  );

  const adimplencyRate =
    totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0;

  return {
    revenueRealizedCents,
    revenueRealizedLabel: formatCurrency(revenueRealizedCents),
    revenueProjectedCents,
    revenueProjectedLabel: formatCurrency(revenueProjectedCents),
    adimplencyRate,
    adimplencyLabel: `${adimplencyRate}%`,
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
  };
}

// -------------------------------------------------------
// Últimos 6 meses para gráfico de linha
// -------------------------------------------------------

export async function getFinanceMonthlyChart(): Promise<FinanceMonthlyData[]> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();
  const results: FinanceMonthlyData[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = date.getFullYear();
    const m = date.getMonth();
    const from = new Date(y, m, 1);
    const to = new Date(y, m + 1, 0, 23, 59, 59, 999);

    const invoices = await db.invoice.findMany({
      where: {
        academyId: academy.id,
        status: { notIn: ['CANCELED', 'REFUNDED'] },
        dueDate: { gte: from, lte: to },
      },
      select: {
        status: true,
        amountInCents: true,
        discountInCents: true,
        payments: { select: { amountInCents: true } },
      },
    });

    const realized = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce(
        (sum, inv) =>
          sum + inv.payments.reduce((s, p) => s + p.amountInCents, 0),
        0,
      );

    const projected = invoices.reduce(
      (sum, inv) => sum + inv.amountInCents - inv.discountInCents,
      0,
    );

    results.push({
      month: MONTH_SHORT[m],
      monthFull: `${MONTH_FULL[m]} ${y}`,
      realized: realized / 100,
      projected: projected / 100,
      realizedLabel: formatCurrency(realized),
      projectedLabel: formatCurrency(projected),
    });
  }

  return results;
}

// -------------------------------------------------------
// Receita por plano
// -------------------------------------------------------

export async function getFinanceReportByPlan(
  year: number,
  month: number,
): Promise<FinanceReportByPlan[]> {
  const academy = await getOrCreateDefaultAcademy();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);

  const invoices = await db.invoice.findMany({
    where: {
      academyId: academy.id,
      status: { notIn: ['CANCELED', 'REFUNDED'] },
      dueDate: { gte: from, lte: to },
    },
    include: {
      subscription: { include: { plan: { select: { name: true } } } },
      payments: { select: { amountInCents: true } },
    },
  });

  const planMap = new Map<
    string,
    { total: number; paid: number; revenue: number }
  >();

  for (const inv of invoices) {
    const planName = inv.subscription?.plan?.name ?? inv.description;
    const existing = planMap.get(planName) ?? { total: 0, paid: 0, revenue: 0 };
    const revenue = inv.payments.reduce((s, p) => s + p.amountInCents, 0);
    planMap.set(planName, {
      total: existing.total + 1,
      paid: existing.paid + (inv.status === 'PAID' ? 1 : 0),
      revenue: existing.revenue + revenue,
    });
  }

  return Array.from(planMap.entries())
    .map(([planName, data]) => ({
      planName,
      totalInvoices: data.total,
      paidInvoices: data.paid,
      revenueCents: data.revenue,
      revenueLabel: formatCurrency(data.revenue),
      adimplencyRate:
        data.total > 0 ? Math.round((data.paid / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents);
}

// -------------------------------------------------------
// Pagamentos do mês
// -------------------------------------------------------

export async function getFinanceReportPayments(
  year: number,
  month: number,
): Promise<FinanceReportPaymentRow[]> {
  const academy = await getOrCreateDefaultAcademy();
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59, 999);

  const payments = await db.payment.findMany({
    where: {
      paidAt: { gte: from, lte: to },
      invoice: { academyId: academy.id },
    },
    include: {
      invoice: {
        include: {
          student: { select: { fullName: true, preferredName: true } },
          subscription: { include: { plan: { select: { name: true } } } },
        },
      },
    },
    orderBy: { paidAt: 'desc' },
  });

  return payments.map((p) => ({
    paymentId: p.id,
    studentName: p.invoice.student.preferredName ?? p.invoice.student.fullName,
    planName: p.invoice.subscription?.plan?.name ?? p.invoice.description,
    amountCents: p.amountInCents,
    amountLabel: formatCurrency(p.amountInCents),
    method: p.method,
    methodLabel: METHOD_LABELS[p.method] ?? p.method,
    paidAt: p.paidAt.toLocaleDateString('pt-BR'),
  }));
}

export { MONTH_FULL };
