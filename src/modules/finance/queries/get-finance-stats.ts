import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type FinanceQuickStats = {
  // Planos
  activePlans: number;
  // Mensalidades
  invoicesThisMonth: number;
  // Cobranças pendentes
  pendingInvoices: number;
  // Pagamentos confirmados no mês
  paidThisMonth: number;
  // Inadimplentes
  overdueInvoices: number;
};

export type FinanceOverviewStats = {
  // Receita realizada no mês (faturas pagas)
  revenueRealizedLabel: string;
  revenueRealizedCents: number;
  // Receita prevista no mês (todas as faturas não canceladas)
  revenueProjectedLabel: string;
  revenueProjectedCents: number;
  // Taxa de adimplência (% de faturas do mês pagas)
  adimplencyRate: number;
  adimplencyLabel: string;
  // Valor total em atraso
  overdueAmountLabel: string;
  overdueAmountCents: number;
};

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

// -------------------------------------------------------
// Cards de acesso rápido — contadores
// -------------------------------------------------------

export async function getFinanceQuickStats(): Promise<FinanceQuickStats> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    activePlans,
    invoicesThisMonth,
    pendingInvoices,
    paidThisMonth,
    overdueInvoices,
  ] = await Promise.all([
    // Planos ativos
    db.plan.count({
      where: { academyId: academy.id, active: true },
    }),

    // Total de faturas do mês (exceto canceladas)
    db.invoice.count({
      where: {
        academyId: academy.id,
        status: { notIn: ['CANCELED', 'REFUNDED'] },
        dueDate: { gte: monthStart, lte: monthEnd },
      },
    }),

    // Faturas pendentes do mês
    db.invoice.count({
      where: {
        academyId: academy.id,
        status: 'PENDING',
        dueDate: { gte: now },
      },
    }),

    // Faturas pagas no mês
    db.invoice.count({
      where: {
        academyId: academy.id,
        status: 'PAID',
        paidAt: { gte: monthStart, lte: monthEnd },
      },
    }),

    // Faturas em atraso (OVERDUE ou PENDING com dueDate no passado)
    db.invoice.count({
      where: {
        academyId: academy.id,
        OR: [
          { status: 'OVERDUE' },
          { status: 'PENDING', dueDate: { lt: now } },
        ],
      },
    }),
  ]);

  return {
    activePlans,
    invoicesThisMonth,
    pendingInvoices,
    paidThisMonth,
    overdueInvoices,
  };
}

// -------------------------------------------------------
// Cards de métricas — overview financeiro
// -------------------------------------------------------

export async function getFinanceOverviewStats(): Promise<FinanceOverviewStats> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [paidInvoices, allInvoices, overdueInvoices] = await Promise.all([
    // Faturas pagas no mês
    db.invoice.findMany({
      where: {
        academyId: academy.id,
        status: 'PAID',
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      select: { amountInCents: true, discountInCents: true },
    }),

    // Todas as faturas do mês (exceto canceladas)
    db.invoice.findMany({
      where: {
        academyId: academy.id,
        status: { notIn: ['CANCELED', 'REFUNDED'] },
        dueDate: { gte: monthStart, lte: monthEnd },
      },
      select: { amountInCents: true, discountInCents: true, status: true },
    }),

    // Faturas em atraso com valor
    db.invoice.findMany({
      where: {
        academyId: academy.id,
        OR: [
          { status: 'OVERDUE' },
          { status: 'PENDING', dueDate: { lt: now } },
        ],
      },
      select: { amountInCents: true, discountInCents: true },
    }),
  ]);

  const revenueRealizedCents = paidInvoices.reduce(
    (sum, inv) => sum + inv.amountInCents - inv.discountInCents,
    0,
  );

  const revenueProjectedCents = allInvoices.reduce(
    (sum, inv) => sum + inv.amountInCents - inv.discountInCents,
    0,
  );

  const overdueAmountCents = overdueInvoices.reduce(
    (sum, inv) => sum + inv.amountInCents - inv.discountInCents,
    0,
  );

  // Taxa de adimplência = faturas pagas / total de faturas do mês
  const totalInvoices = allInvoices.length;
  const paidCount = allInvoices.filter((inv) => inv.status === 'PAID').length;
  const adimplencyRate =
    totalInvoices > 0 ? Math.round((paidCount / totalInvoices) * 100) : 0;

  return {
    revenueRealizedCents,
    revenueRealizedLabel: formatCurrency(revenueRealizedCents),
    revenueProjectedCents,
    revenueProjectedLabel: formatCurrency(revenueProjectedCents),
    adimplencyRate,
    adimplencyLabel: `${adimplencyRate}%`,
    overdueAmountCents,
    overdueAmountLabel: formatCurrency(overdueAmountCents),
  };
}
