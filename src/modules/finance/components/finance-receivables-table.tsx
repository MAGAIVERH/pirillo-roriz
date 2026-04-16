import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

type FinanceReceivablesTableProps = {
  rows: {
    student: string;
    plan: string;
    dueDate: string;
    paidInMonth: string;
    pending: string;
    status: string;
  }[];
};

const getStatusClasses = (status: string) => {
  if (status === 'Pago') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
  }

  if (status === 'Vencido') {
    return 'border-red-500/20 bg-red-500/10 text-red-400';
  }

  return 'border-amber-500/20 bg-amber-500/10 text-amber-400';
};

export const FinanceReceivablesTable = ({
  rows,
}: FinanceReceivablesTableProps) => {
  return (
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
          {rows.map((row) => (
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
                <Badge className={getStatusClasses(row.status)}>
                  {row.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
