import {
  AlertTriangle,
  BadgeDollarSign,
  CreditCard,
  FileBarChart2,
  Plus,
  PlusCircle,
  Receipt,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FinanceReceivablesTable } from '@/modules/finance/components/finance-receivables-table';
import { FinanceSummaryCards } from '@/modules/finance/components/finance-summary-cards';
import {
  getFinancialOverview,
  getFinanceReceivablesRows,
} from '@/modules/finance/queries/finance-dashboard-queries';

// -------------------------------------------------------
// Quick Actions — dados estáticos (só navegação)
// -------------------------------------------------------

const financeQuickActions = [
  {
    title: 'Planos',
    description: 'Valores, periodicidade e vínculo com alunos.',
    icon: Receipt,
  },
  {
    title: 'Mensalidades',
    description: 'Controle do mês, vencimentos e recorrência.',
    icon: CreditCard,
  },
  {
    title: 'Cobranças',
    description: 'Pendências, vencidos e recuperação.',
    icon: PlusCircle,
  },
  {
    title: 'Pagamentos',
    description: 'Registro manual, confirmações e histórico.',
    icon: Wallet,
  },
  {
    title: 'Inadimplência',
    description: 'Atrasos, dias vencidos e prioridade de cobrança.',
    icon: AlertTriangle,
  },
  {
    title: 'Relatórios',
    description: 'Receita, previsão e indicadores financeiros.',
    icon: FileBarChart2,
  },
];

// -------------------------------------------------------
// Page — Server Component async
// -------------------------------------------------------

export default async function AdminFinanceiroPage() {
  // Busca paralela para não bloquear uma query na outra
  const [overview, receivablesRows] = await Promise.all([
    getFinancialOverview(),
    getFinanceReceivablesRows(),
  ]);

  // Monta o formato que FinanceSummaryCards espera
  const financialOverview = [
    {
      title: 'Receita do mês',
      value: overview.revenuePaidLabel,
      description: 'Total recebido no mês atual.',
      icon: TrendingUp,
    },
    {
      title: 'Receita prevista',
      value: overview.revenueProjectedLabel,
      description: 'Projeção com base nas cobranças ativas.',
      icon: BadgeDollarSign,
    },
    {
      title: 'Em aberto',
      value: overview.pendingLabel,
      description: 'Valores pendentes de recebimento.',
      icon: Wallet,
    },
    {
      title: 'Cobranças vencidas',
      value: overview.overdueLabel,
      description: 'Pagamentos que já passaram do vencimento.',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Cabeçalho */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
              Módulo
            </p>

            <h1 className='text-3xl font-bold tracking-tight'>Financeiro</h1>

            <p className='max-w-4xl text-sm leading-7 text-zinc-400'>
              Aqui o administrador acompanha receita, projeção financeira,
              cobranças, mensalidades, inadimplência e a saúde financeira da
              academia em um único lugar.
            </p>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <Button className='bg-red-600 text-white hover:bg-red-500'>
              <Wallet className='mr-2 h-4 w-4' />
              Registrar pagamento manual
            </Button>

            <Button
              variant='outline'
              className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
            >
              <Plus className='mr-2 h-4 w-4' />
              Nova cobrança
            </Button>
          </div>
        </div>
      </section>

      {/* Cards de resumo com dados reais */}
      <FinanceSummaryCards items={financialOverview} />

      {/* Acesso rápido */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold text-white'>Acesso rápido</h2>
          <p className='text-sm text-zinc-400'>
            Atalhos operacionais para as áreas principais do financeiro.
          </p>
        </div>

        <div className='mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {financeQuickActions.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className='border-white/10 bg-zinc-950 text-white transition hover:border-red-500/30 hover:bg-zinc-900'
            >
              <CardContent className='flex items-start gap-4 px-5 py-5'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600/15 text-red-500'>
                  <Icon className='h-5 w-5' />
                </div>

                <div className='space-y-2'>
                  <h3 className='text-lg font-semibold text-white'>{title}</h3>
                  <p className='text-sm leading-6 text-zinc-400'>
                    {description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tabela de recebíveis com dados reais */}
      <FinanceReceivablesTable rows={receivablesRows} />
    </div>
  );
}
