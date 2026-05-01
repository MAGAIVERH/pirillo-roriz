import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}

// -------------------------------------------------------
// Tipos exportados
// -------------------------------------------------------

export type FinanceOverviewData = {
  revenuePaidCents: number;
  revenueProjectedCents: number;
  pendingCents: number;
  overdueCount: number;
  // Formatados para exibição
  revenuePaidLabel: string;
  revenueProjectedLabel: string;
  pendingLabel: string;
  overdueLabel: string;
};

export type FinanceReceivableRow = {
  invoiceId: string;
  student: string;
  plan: string;
  dueDate: string;
  paidInMonth: string;
  pending: string;
  status: 'Pago' | 'Vencido' | 'Pendente';
};

// -------------------------------------------------------
// Queries
// -------------------------------------------------------

/**
 * Retorna os 4 indicadores do topo da página financeira:
 * - Receita do mês (faturas pagas no mês atual)
 * - Receita prevista (total de faturas com vencimento no mês, independente de status)
 * - Em aberto (faturas PENDING com vencimento futuro)
 * - Cobranças vencidas (faturas OVERDUE ou PENDING com dueDate < hoje)
 */
export async function getFinancialOverview(): Promise<FinanceOverviewData> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // 1. Receita do mês: faturas pagas dentro do mês atual
  const paidInvoices = await db.invoice.findMany({
    where: {
      academyId: academy.id,
      status: 'PAID',
      paidAt: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    select: { amountInCents: true, discountInCents: true },
  });

  const revenuePaidCents = paidInvoices.reduce(
    (sum, inv) => sum + inv.amountInCents - inv.discountInCents,
    0,
  );

  // 2. Receita prevista: todas as faturas com vencimento no mês (exceto canceladas)
  const projectedInvoices = await db.invoice.findMany({
    where: {
      academyId: academy.id,
      status: { notIn: ['CANCELED', 'REFUNDED'] },
      dueDate: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    select: { amountInCents: true, discountInCents: true },
  });

  const revenueProjectedCents = projectedInvoices.reduce(
    (sum, inv) => sum + inv.amountInCents - inv.discountInCents,
    0,
  );

  // 3. Em aberto: faturas PENDING com vencimento no futuro
  const pendingInvoices = await db.invoice.findMany({
    where: {
      academyId: academy.id,
      status: 'PENDING',
      dueDate: { gte: now },
    },
    select: { amountInCents: true, discountInCents: true },
  });

  const pendingCents = pendingInvoices.reduce(
    (sum, inv) => sum + inv.amountInCents - inv.discountInCents,
    0,
  );

  // 4. Cobranças vencidas: OVERDUE ou PENDING com dueDate no passado
  const overdueCount = await db.invoice.count({
    where: {
      academyId: academy.id,
      OR: [
        { status: 'OVERDUE' },
        {
          status: 'PENDING',
          dueDate: { lt: now },
        },
      ],
    },
  });

  return {
    revenuePaidCents,
    revenueProjectedCents,
    pendingCents,
    overdueCount,
    revenuePaidLabel: formatCurrency(revenuePaidCents),
    revenueProjectedLabel: formatCurrency(revenueProjectedCents),
    pendingLabel: formatCurrency(pendingCents),
    overdueLabel: String(overdueCount),
  };
}

/**
 * Retorna as linhas da tabela de cobranças e recebimentos.
 * Busca as faturas com vencimento no mês atual, com dados do aluno e plano.
 */
export async function getFinanceReceivablesRows(): Promise<
  FinanceReceivableRow[]
> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const invoices = await db.invoice.findMany({
    where: {
      academyId: academy.id,
      status: { notIn: ['CANCELED', 'REFUNDED'] },
      dueDate: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
    include: {
      student: {
        select: { fullName: true, preferredName: true },
      },
      subscription: {
        include: {
          plan: { select: { name: true } },
        },
      },
      payments: {
        select: { amountInCents: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  return invoices.map((inv) => {
    const studentName = inv.student.preferredName ?? inv.student.fullName;

    const planName = inv.subscription?.plan?.name ?? inv.description;

    const netAmount = inv.amountInCents - inv.discountInCents;

    const paidCents = inv.payments.reduce((sum, p) => sum + p.amountInCents, 0);

    const pendingCents = Math.max(0, netAmount - paidCents);

    // Determina o status legível
    let status: FinanceReceivableRow['status'];
    if (inv.status === 'PAID') {
      status = 'Pago';
    } else if (inv.status === 'OVERDUE' || inv.dueDate < now) {
      status = 'Vencido';
    } else {
      status = 'Pendente';
    }

    return {
      invoiceId: inv.id,
      student: studentName,
      plan: planName,
      dueDate: formatDate(inv.dueDate),
      paidInMonth: formatCurrency(paidCents),
      pending: formatCurrency(pendingCents),
      status,
    };
  });
}
