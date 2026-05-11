import Link from 'next/link';
import {
  ArrowLeft,
  BadgeDollarSign,
  FileText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FinanceReportFilter } from '@/modules/finance/components/finance-report-filter';
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
// Helpers
// -------------------------------------------------------

const METHOD_COLORS: Record<string, string> = {
  PIX: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  CASH: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  CARD: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
  BANK_TRANSFER: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
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
          <div className='space-y-3'>
            <Button
              asChild
              variant='outline'
              className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
            >
              <Link href='/admin/financeiro'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Voltar ao financeiro
              </Link>
            </Button>

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

          <div className='mt-6 overflow-hidden rounded-2xl border border-white/10'>
            <div className='grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] border-b border-white/10 bg-zinc-900 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-400'>
              <span>Plano</span>
              <span>Faturas</span>
              <span>Pagas</span>
              <span>Adimplência</span>
              <span>Receita</span>
            </div>
            <div className='divide-y divide-white/10'>
              {byPlan.map((plan) => (
                <div
                  key={plan.planName}
                  className='grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 text-sm'
                >
                  <span className='font-semibold text-white'>
                    {plan.planName}
                  </span>
                  <span className='text-zinc-300'>{plan.totalInvoices}</span>
                  <span className='text-zinc-300'>{plan.paidInvoices}</span>
                  <span
                    className={
                      plan.adimplencyRate >= 80
                        ? 'font-medium text-emerald-400'
                        : 'font-medium text-red-400'
                    }
                  >
                    {plan.adimplencyRate}%
                  </span>
                  <span className='font-semibold text-emerald-400'>
                    {plan.revenueLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Pagamentos recebidos ────────────────────────── */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <h2 className='text-lg font-semibold text-white'>
              Pagamentos recebidos
            </h2>
            <p className='text-sm text-zinc-400'>
              Todos os pagamentos confirmados em {monthName} {year}.
            </p>
          </div>
          {payments.length > 0 && (
            <span className='rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300'>
              {payments.length} registro{payments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div className='mt-6 overflow-hidden rounded-2xl border border-white/10'>
          <div className='grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] border-b border-white/10 bg-zinc-900 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-400'>
            <span>Aluno</span>
            <span>Plano</span>
            <span>Valor</span>
            <span>Forma</span>
            <span>Data</span>
          </div>

          <div className='divide-y divide-white/10'>
            {payments.length === 0 ? (
              <div className='px-6 py-16 text-center text-sm text-zinc-500'>
                Nenhum pagamento confirmado em {monthName} {year}.
              </div>
            ) : (
              payments.map((p) => (
                <div
                  key={p.paymentId}
                  className='grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr] items-center px-6 py-4 text-sm'
                >
                  <span className='font-semibold text-white'>
                    {p.studentName}
                  </span>
                  <span className='text-zinc-300'>{p.planName}</span>
                  <span className='font-semibold text-emerald-400'>
                    {p.amountLabel}
                  </span>
                  <div>
                    <Badge
                      className={
                        METHOD_COLORS[p.method] ??
                        'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
                      }
                    >
                      {p.methodLabel}
                    </Badge>
                  </div>
                  <span className='text-zinc-300'>{p.paidAt}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
