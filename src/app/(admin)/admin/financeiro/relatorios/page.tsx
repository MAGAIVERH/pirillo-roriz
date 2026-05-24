import {
  BadgeDollarSign,
  FileText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

import { AdminBackButton } from '@/components/layout/admin-back-button';
import { FinanceReportFilter } from '@/modules/finance/components/finance-report-filter';
import { FinanceReportByPlanTable } from '@/modules/finance/components/finance-report-by-plan-table';
import { FinanceReportPaymentsTable } from '@/modules/finance/components/finance-report-payments-table';
import {
  FinanceAreaChart,
  FinanceDonutChart,
} from '@/modules/finance/components/finance-charts';
import {
  MONTH_FULL,
  getFinanceReportSummary,
  getFinanceReportPayments,
  getFinanceReportByPlan,
  getFinanceMonthlyChart,
} from '@/modules/finance/queries/get-finance-reports';

// -------------------------------------------------------
// Props
// -------------------------------------------------------

type AdminFinanceiroRelatoriosPageProps = {
  searchParams: Promise<{ month?: string; year?: string }>;
};

// -------------------------------------------------------
// Page — Server Component
// -------------------------------------------------------

export default async function AdminFinanceiroRelatoriosPage({
  searchParams,
}: AdminFinanceiroRelatoriosPageProps) {
  const params = await searchParams;
  const now = new Date();

  const month = Math.min(
    12,
    Math.max(1, parseInt(params.month ?? String(now.getMonth() + 1))),
  );
  const year = parseInt(params.year ?? String(now.getFullYear()));

  const [summary, payments, byPlan, monthlyChart] = await Promise.all([
    getFinanceReportSummary(year, month),
    getFinanceReportPayments(year, month),
    getFinanceReportByPlan(year, month),
    getFinanceMonthlyChart(),
  ]);

  const monthName = MONTH_FULL[month - 1];

  const metricCards = [
    {
      title: 'Receita realizada',
      value: summary.revenueRealizedLabel,
      description: `${summary.paidInvoices} fatura${
        summary.paidInvoices !== 1 ? 's' : ''
      } paga${summary.paidInvoices !== 1 ? 's' : ''} no mês.`,
      icon: TrendingUp,
      highlight: false,
      valueColor: 'text-white',
    },
    {
      title: 'Receita prevista',
      value: summary.revenueProjectedLabel,
      description: `${summary.totalInvoices} fatura${
        summary.totalInvoices !== 1 ? 's' : ''
      } gerada${summary.totalInvoices !== 1 ? 's' : ''} no mês.`,
      icon: BadgeDollarSign,
      highlight: false,
      valueColor: 'text-white',
    },
    {
      title: 'Adimplência',
      value: summary.adimplencyLabel,
      description:
        summary.adimplencyRate >= 80
          ? 'Boa taxa — pagamentos em dia.'
          : 'Atenção — taxa abaixo do ideal.',
      icon: ShieldCheck,
      highlight: summary.adimplencyRate < 80,
      valueColor:
        summary.adimplencyRate >= 80 ? 'text-emerald-400' : 'text-red-400',
    },
    {
      title: 'Em atraso',
      value: String(summary.overdueInvoices),
      description: `${summary.pendingInvoices} pendente${
        summary.pendingInvoices !== 1 ? 's' : ''
      }, ${summary.overdueInvoices} vencida${
        summary.overdueInvoices !== 1 ? 's' : ''
      }.`,
      icon: FileText,
      highlight: summary.overdueInvoices > 0,
      valueColor: summary.overdueInvoices > 0 ? 'text-red-400' : 'text-white',
    },
  ];

  return (
    <div className='space-y-6'>
      {/* ── Cabeçalho ───────────────────────────────────── */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-4'>
            <AdminBackButton
              href='/admin/financeiro'
              label='Voltar ao financeiro'
            />

            <div className='space-y-1'>
              <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
                Financeiro
              </p>
              <h1 className='text-3xl font-bold tracking-tight'>Relatórios</h1>
              <p className='text-sm text-zinc-400'>
                Visualizando{' '}
                <span className='font-semibold text-white'>
                  {monthName} {year}
                </span>
              </p>
            </div>
          </div>

          <FinanceReportFilter month={month} year={year} />
        </div>
      </section>

      {/* ── Cards de métricas ───────────────────────────── */}
      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map(
          ({
            title,
            value,
            description,
            icon: Icon,
            highlight,
            valueColor,
          }) => (
            <div
              key={title}
              className={`rounded-2xl border p-5 ${
                highlight
                  ? 'border-red-500/30 bg-red-500/5'
                  : 'border-white/10 bg-zinc-950'
              }`}
            >
              <div className='flex items-start justify-between'>
                <p className='text-sm font-medium text-zinc-400'>{title}</p>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    highlight
                      ? 'bg-red-600/20 text-red-400'
                      : 'bg-red-600/15 text-red-500'
                  }`}
                >
                  <Icon className='h-4 w-4' />
                </div>
              </div>
              <p className={`mt-3 text-3xl font-bold ${valueColor}`}>{value}</p>
              <p className='mt-2 text-sm text-zinc-400'>{description}</p>
            </div>
          ),
        )}
      </section>

      {/* ── Gráficos ────────────────────────────────────── */}
      <section className='grid gap-6 xl:grid-cols-[1fr_320px]'>
        {/* Gráfico de área — últimos 6 meses */}
        <div className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold text-white'>
              Evolução — últimos 6 meses
            </h2>
            <p className='text-sm text-zinc-400'>
              Linha sólida = receita realizada · Linha tracejada = receita
              prevista.
            </p>
          </div>
          <div className='mt-6'>
            <FinanceAreaChart data={monthlyChart} />
          </div>
        </div>

        {/* Gráfico de rosca — adimplência */}
        <div className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold text-white'>
              Adimplência — {monthName}
            </h2>
            <p className='text-sm text-zinc-400'>
              Distribuição das faturas por status.
            </p>
          </div>
          <div className='mt-6'>
            <FinanceDonutChart
              paid={summary.paidInvoices}
              pending={summary.pendingInvoices}
              overdue={summary.overdueInvoices}
            />
          </div>
        </div>
      </section>

      {/* ── Receita por plano ───────────────────────────── */}
      {byPlan.length > 0 && (
        <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold text-white'>
              Receita por plano
            </h2>
            <p className='text-sm text-zinc-400'>
              Desempenho financeiro de cada plano em {monthName} {year}.
            </p>
          </div>

          <div className='mt-6'>
            <FinanceReportByPlanTable rows={byPlan} />
          </div>
        </section>
      )}

      {/* ── Pagamentos recebidos ────────────────────────── */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='space-y-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <h2 className='text-lg font-semibold text-white'>
              Pagamentos recebidos
            </h2>
            {payments.length > 0 ? (
              <span className='inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300'>
                {payments.length} registro{payments.length !== 1 ? 's' : ''}
              </span>
            ) : null}
          </div>
          <p className='text-sm text-zinc-400'>
            Todos os pagamentos confirmados em {monthName} {year}.
          </p>
        </div>

        <div className='mt-6'>
          <FinanceReportPaymentsTable
            rows={payments}
            emptyMessage={`Nenhum pagamento confirmado em ${monthName} ${year}.`}
          />
        </div>
      </section>
    </div>
  );
}
