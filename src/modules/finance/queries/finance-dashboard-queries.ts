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

export type FinanceFilter =
  | 'cobrancas'
  | 'pagamentos'
  | 'inadimplencia'
  | 'mensalidades';

export type FinanceOverviewData = {
  revenuePaidCents: number;
  revenueProjectedCents: number;
  pendingCents: number;
  overdueCount: number;
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
  amountInCents: number;
};

export type FinanceTableMeta = {
  title: string;
  description: string;
};

// -------------------------------------------------------
// Metadados da tabela por filtro
// -------------------------------------------------------

export function getFinanceTableMeta(filter: FinanceFilter): FinanceTableMeta {
  const map: Record<FinanceFilter, FinanceTableMeta> = {
    cobrancas: {
      title: 'Cobranças pendentes',
      description: 'Faturas pendentes e vencidas que precisam de atenção.',
    },
    pagamentos: {
      title: 'Pagamentos do mês',
      description: 'Faturas já pagas no mês atual.',
    },
    inadimplencia: {
      title: 'Inadimplência',
      description: 'Faturas vencidas ordenadas por prioridade de cobrança.',
    },
    mensalidades: {
      title: 'Mensalidades do mês',
      description: 'Todas as faturas com vencimento no mês atual.',
    },
  };

  return map[filter];
}

// -------------------------------------------------------
// Queries
// -------------------------------------------------------

export async function getFinancialOverview(): Promise<FinanceOverviewData> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const paidInvoices = await db.invoice.findMany({
    where: {
      academyId: academy.id,
      status: 'PAID',
      paidAt: { gte: monthStart, lte: monthEnd },
    },
    select: { amountInCents: true, discountInCents: true },
  });

  const revenuePaidCents = paidInvoices.reduce(
    (sum, inv) => sum + inv.amountInCents - inv.discountInCents,
    0,
  );

  const projectedInvoices = await db.invoice.findMany({
    where: {
      academyId: academy.id,
      status: { notIn: ['CANCELED', 'REFUNDED'] },
      dueDate: { gte: monthStart, lte: monthEnd },
    },
    select: { amountInCents: true, discountInCents: true },
  });

  const revenueProjectedCents = projectedInvoices.reduce(
    (sum, inv) => sum + inv.amountInCents - inv.discountInCents,
    0,
  );

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

  const overdueCount = await db.invoice.count({
    where: {
      academyId: academy.id,
      OR: [{ status: 'OVERDUE' }, { status: 'PENDING', dueDate: { lt: now } }],
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

export async function getFinanceReceivablesRows(
  filter: FinanceFilter = 'cobrancas',
): Promise<FinanceReceivableRow[]> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  type InvoiceStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED' | 'REFUNDED';

  let statusFilter: InvoiceStatus[] = [];
  let dueDateFilter: { gte?: Date; lte?: Date; lt?: Date } | undefined;
  let orderBy: { dueDate: 'asc' | 'desc' } = { dueDate: 'asc' };

  if (filter === 'cobrancas') {
    statusFilter = ['PENDING', 'OVERDUE'];
    dueDateFilter = { gte: monthStart, lte: monthEnd };
  } else if (filter === 'pagamentos') {
    statusFilter = ['PAID'];
    dueDateFilter = { gte: monthStart, lte: monthEnd };
  } else if (filter === 'inadimplencia') {
    statusFilter = ['PENDING', 'OVERDUE'];
    dueDateFilter = { lt: now };
    orderBy = { dueDate: 'asc' };
  } else if (filter === 'mensalidades') {
    statusFilter = ['PENDING', 'PAID', 'OVERDUE'];
    dueDateFilter = { gte: monthStart, lte: monthEnd };
  }

  const invoices = await db.invoice.findMany({
    where: {
      academyId: academy.id,
      status: { in: statusFilter },
      dueDate: dueDateFilter,
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
    orderBy,
  });

  return invoices.map((inv) => {
    const studentName = inv.student.preferredName ?? inv.student.fullName;
    const planName = inv.subscription?.plan?.name ?? inv.description;
    const netAmount = inv.amountInCents - inv.discountInCents;
    const paidCents = inv.payments.reduce((sum, p) => sum + p.amountInCents, 0);
    const pendingCents = Math.max(0, netAmount - paidCents);

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
      amountInCents: netAmount,
    };
  });
}
