import Link from 'next/link';
import {
  AlertTriangle,
  BadgeDollarSign,
  CreditCard,
  FileBarChart2,
  PlusCircle,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { FinanceReceivablesTable } from '@/modules/finance/components/finance-receivables-table';
import {
  type FinanceFilter,
  getFinanceReceivablesRows,
  getFinanceTableMeta,
} from '@/modules/finance/queries/finance-dashboard-queries';
import {
  getFinanceQuickStats,
  getFinanceOverviewStats,
} from '@/modules/finance/queries/get-finance-stats';

// -------------------------------------------------------
// Filtros válidos
// -------------------------------------------------------

const VALID_FILTERS: FinanceFilter[] = [
  'cobrancas',
  'pagamentos',
  'inadimplencia',
  'mensalidades',
];

function isValidFilter(value: string | undefined): value is FinanceFilter {
  return VALID_FILTERS.includes(value as FinanceFilter);
}

type AdminFinanceiroPageProps = {
  searchParams: Promise<{ filtro?: string }>;
};

export default async function AdminFinanceiroPage({
  searchParams,
}: AdminFinanceiroPageProps) {
  const { filtro } = await searchParams;
  const activeFilter: FinanceFilter = isValidFilter(filtro)
    ? filtro
    : 'cobrancas';

  const [overview, quickStats, receivablesRows] = await Promise.all([
    getFinanceOverviewStats(),
    getFinanceQuickStats(),
    getFinanceReceivablesRows(activeFilter),
  ]);

  const tableMeta = getFinanceTableMeta(activeFilter);

  const metricCards = [
    {
      title: 'Receita realizada',
      value: overview.revenueRealizedLabel,
      description: 'Total efetivamente recebido no mês.',
      icon: TrendingUp,
      highlight: false,
    },
    {
      title: 'Receita prevista',
      value: overview.revenueProjectedLabel,
      description: 'Projeção total de faturas do mês.',
      icon: BadgeDollarSign,
      highlight: false,
    },
    {
      title: 'Adimplência',
      value: overview.adimplencyLabel,
      description: `${
        overview.adimplencyRate >= 80 ? 'Boa taxa' : 'Atenção necessária'
      } — % de faturas pagas no mês.`,
      icon: ShieldCheck,
      highlight: overview.adimplencyRate < 80,
    },
    {
      title: 'Em atraso',
      value: overview.overdueAmountLabel,
      description: 'Valor total de faturas vencidas sem pagamento.',
      icon: AlertTriangle,
      highlight: overview.overdueAmountCents > 0,
    },
  ];

  const quickActions = [
    {
      title: 'Planos',
      description: 'Planos de cobrança disponíveis.',
      counter: `${quickStats.activePlans} ativo${
        quickStats.activePlans !== 1 ? 's' : ''
      }`,
      icon: Receipt,
      href: '/admin/financeiro/planos',
      filter: null,
      alert: false,
    },
    {
      title: 'Mensalidades',
      description: 'Faturas com vencimento no mês atual.',
      counter: `${quickStats.invoicesThisMonth} fatura${
        quickStats.invoicesThisMonth !== 1 ? 's' : ''
      }`,
      icon: CreditCard,
      href: '/admin/financeiro?filtro=mensalidades#tabela',
      filter: 'mensalidades' as FinanceFilter,
      alert: false,
    },
    {
      title: 'Cobranças',
      description: 'Faturas pendentes aguardando pagamento.',
      counter: `${quickStats.pendingInvoices} pendente${
        quickStats.pendingInvoices !== 1 ? 's' : ''
      }`,
      icon: PlusCircle,
      href: '/admin/financeiro?filtro=cobrancas#tabela',
      filter: 'cobrancas' as FinanceFilter,
      alert: false,
    },
    {
      title: 'Pagamentos',
      description: 'Pagamentos confirmados no mês.',
      counter: `${quickStats.paidThisMonth} pago${
        quickStats.paidThisMonth !== 1 ? 's' : ''
      }`,
      icon: Wallet,
      href: '/admin/financeiro?filtro=pagamentos#tabela',
      filter: 'pagamentos' as FinanceFilter,
      alert: false,
    },
    {
      title: 'Inadimplência',
      description: 'Faturas vencidas sem pagamento.',
      counter: `${quickStats.overdueInvoices} em atraso`,
      icon: AlertTriangle,
      href: '/admin/financeiro?filtro=inadimplencia#tabela',
      filter: 'inadimplencia' as FinanceFilter,
      alert: quickStats.overdueInvoices > 0,
    },
    {
      title: 'Relatórios',
      description: 'Análises e indicadores financeiros detalhados.',
      counter: 'Analytics',
      icon: FileBarChart2,
      href: '/admin/financeiro/relatorios',
      filter: null,
      alert: false,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Cabeçalho */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
            Módulo
          </p>
          <h1 className='text-3xl font-bold tracking-tight'>Financeiro</h1>
          <p className='max-w-4xl text-sm leading-7 text-zinc-400'>
            Acompanhe receita, adimplência, cobranças e mensalidades da academia
            em tempo real.
          </p>
        </div>
      </section>

      {/* Cards de métricas */}
      <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map(
          ({ title, value, description, icon: Icon, highlight }) => (
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
              <p
                className={`mt-3 text-3xl font-bold ${
                  highlight ? 'text-red-400' : 'text-white'
                }`}
              >
                {value}
              </p>
              <p className='mt-2 text-sm text-zinc-400'>{description}</p>
            </div>
          ),
        )}
      </section>

      {/* Acesso rápido com contadores reais */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-1'>
          <h2 className='text-2xl font-semibold text-white'>Acesso rápido</h2>
          <p className='text-sm text-zinc-400'>
            Selecione uma área para filtrar as informações abaixo.
          </p>
        </div>

        <div className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {quickActions.map(
            ({
              title,
              description,
              counter,
              icon: Icon,
              href,
              filter,
              alert,
            }) => {
              const isActive = filter !== null && filter === activeFilter;

              return (
                <Link
                  key={title}
                  href={href}
                  className={`flex items-start gap-4 rounded-2xl border px-5 py-5 transition ${
                    isActive
                      ? 'border-red-500/50 bg-red-500/10'
                      : alert
                      ? 'border-red-500/20 bg-zinc-950 hover:border-red-500/40 hover:bg-zinc-900'
                      : 'border-white/10 bg-zinc-950 hover:border-red-500/30 hover:bg-zinc-900'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      isActive
                        ? 'bg-red-600/30 text-red-400'
                        : alert
                        ? 'bg-red-600/20 text-red-400'
                        : 'bg-red-600/15 text-red-500'
                    }`}
                  >
                    <Icon className='h-5 w-5' />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center justify-between gap-2'>
                      <h3
                        className={`text-base font-semibold ${
                          isActive ? 'text-red-400' : 'text-white'
                        }`}
                      >
                        {title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                          isActive
                            ? 'bg-red-500/20 text-red-400'
                            : alert
                            ? 'bg-red-500/15 text-red-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {counter}
                      </span>
                    </div>
                    <p className='mt-1 text-sm leading-5 text-zinc-400'>
                      {description}
                    </p>
                  </div>
                </Link>
              );
            },
          )}
        </div>
      </section>

      {/* Tabela filtrada */}
      <FinanceReceivablesTable
        rows={receivablesRows}
        title={tableMeta.title}
        description={tableMeta.description}
      />
    </div>
  );
}
