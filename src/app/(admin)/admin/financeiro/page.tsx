import {
  AlertTriangle,
  BadgeDollarSign,
  Plus,
  Search,
  TrendingUp,
  Wallet,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FinanceSummaryCards } from '@/modules/finance/components/finance-summary-cards';
import type { FinanceSummaryItem } from '@/modules/finance/types/finance-summary';

const financialOverview: FinanceSummaryItem[] = [
  {
    title: 'Receita do mês',
    value: 'R$ 18.450,00',
    description: 'Total recebido no mês atual.',
    icon: TrendingUp,
  },
  {
    title: 'Receita prevista',
    value: 'R$ 21.300,00',
    description: 'Projeção com base nas cobranças ativas.',
    icon: BadgeDollarSign,
  },
  {
    title: 'Em aberto',
    value: 'R$ 3.120,00',
    description: 'Valores pendentes de recebimento.',
    icon: Wallet,
  },
  {
    title: 'Cobranças vencidas',
    value: '8',
    description: 'Pagamentos que já passaram do vencimento.',
    icon: AlertTriangle,
  },
];

const financialBlocks = [
  {
    title: 'Planos',
    description:
      'Estruture valores, periodicidade, desconto, taxa de matrícula e vínculo com os alunos.',
  },
  {
    title: 'Mensalidades',
    description:
      'Acompanhe cobranças futuras, vencimentos do mês e alunos com pagamento regular.',
  },
  {
    title: 'Cobranças',
    description:
      'Gerencie pagamentos pendentes, cobranças vencidas, reenvio e ações de recuperação.',
  },
  {
    title: 'Pagamentos',
    description:
      'Tenha visão de pagamentos confirmados, manuais, recorrentes e histórico financeiro.',
  },
  {
    title: 'Inadimplência',
    description:
      'Liste alunos em atraso, dias vencidos, valores pendentes e prioridade de cobrança.',
  },
  {
    title: 'Relatórios financeiros',
    description:
      'Consolide receita, previsão, pendência e indicadores para decisão gerencial.',
  },
];

const financialRows = [
  {
    student: 'Rafael Morais',
    plan: 'Plano Adulto',
    dueDate: '10/04/2026',
    paidInMonth: 'R$ 180,00',
    pending: 'R$ 0,00',
    status: 'Pago',
  },
  {
    student: 'Jorge Augusto',
    plan: 'Plano Competição',
    dueDate: '12/04/2026',
    paidInMonth: 'R$ 0,00',
    pending: 'R$ 220,00',
    status: 'Vencido',
  },
  {
    student: 'Helano Magalhães',
    plan: 'Plano Kids',
    dueDate: '15/04/2026',
    paidInMonth: 'R$ 160,00',
    pending: 'R$ 0,00',
    status: 'Pago',
  },
  {
    student: 'Carlos Henrique',
    plan: 'Plano No-Gi',
    dueDate: '18/04/2026',
    paidInMonth: 'R$ 0,00',
    pending: 'R$ 190,00',
    status: 'Pendente',
  },
  {
    student: 'Fernanda Alves',
    plan: 'Plano Adulto',
    dueDate: '20/04/2026',
    paidInMonth: 'R$ 180,00',
    pending: 'R$ 0,00',
    status: 'Pago',
  },
];

const getStatusClasses = (status: string) => {
  if (status === 'Pago') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
  }

  if (status === 'Vencido') {
    return 'border-red-500/20 bg-red-500/10 text-red-400';
  }

  return 'border-amber-500/20 bg-amber-500/10 text-amber-400';
};

export default function AdminFinanceiroPage() {
  return (
    <div className='space-y-6'>
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

          <Button className='bg-red-600 text-white hover:bg-red-500 lg:w-auto'>
            <Plus className='mr-2 h-4 w-4' />
            Nova cobrança
          </Button>
        </div>
      </section>

      <FinanceSummaryCards items={financialOverview} />

      <section className='grid gap-4 xl:grid-cols-2'>
        {financialBlocks.map((block) => (
          <Card
            key={block.title}
            className='border-white/10 bg-zinc-950 text-white'
          >
            <CardContent className='px-6 py-6'>
              <h2 className='text-2xl font-semibold text-white'>
                {block.title}
              </h2>
              <p className='mt-3 max-w-2xl text-sm leading-7 text-zinc-400'>
                {block.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
          <div>
            <h2 className='text-2xl font-semibold text-white'>
              Cobranças e recebimentos
            </h2>
            <p className='mt-2 text-sm text-zinc-400'>
              Visão financeira dos alunos cadastrados na academia.
            </p>
          </div>

          <div className='flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900 px-4 text-zinc-400 xl:w-90'>
            <Search className='h-4 w-4' />
            <span className='text-sm'>
              Buscar por aluno, plano ou vencimento...
            </span>
          </div>
        </div>

        <div className='mt-6 overflow-hidden rounded-2xl border border-white/10'>
          <div className='grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_140px] border-b border-white/10 bg-zinc-900 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-zinc-400'>
            <span>Aluno</span>
            <span>Plano</span>
            <span>Vencimento</span>
            <span>Pago no mês</span>
            <span>Em aberto</span>
            <span>Status</span>
          </div>

          <div className='divide-y divide-white/10'>
            {financialRows.map((row) => (
              <div
                key={`${row.student}-${row.plan}`}
                className='grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_140px] items-center px-6 py-5 text-sm text-white'
              >
                <div className='space-y-1'>
                  <p className='font-semibold text-white'>{row.student}</p>
                  <p className='text-zinc-400'>Aluno vinculado ao financeiro</p>
                </div>

                <span className='text-zinc-300'>{row.plan}</span>
                <span className='text-zinc-300'>{row.dueDate}</span>
                <span className='text-zinc-300'>{row.paidInMonth}</span>
                <span className='text-zinc-300'>{row.pending}</span>

                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                      row.status,
                    )}`}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
