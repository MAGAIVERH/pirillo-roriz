'use client';

import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { RegisterPaymentDialog } from '@/modules/finance/components/register-payment-dialog';
import type { FinanceReceivableRow } from '@/modules/finance/queries/finance-dashboard-queries';

type FinanceReceivablesTableProps = {
  rows: FinanceReceivableRow[];
  title: string;
  description: string;
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
  title,
  description,
}: FinanceReceivablesTableProps) => {
  return (
    <section
      id='tabela'
      className='rounded-2xl border border-white/10 bg-zinc-950 p-6'
    >
      <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
        <div>
          <h2 className='text-2xl font-semibold text-white'>{title}</h2>
          <p className='mt-2 text-sm text-zinc-400'>{description}</p>
        </div>

        <div className='flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-zinc-900 px-4 text-zinc-400 xl:w-90'>
          <Search className='h-4 w-4' />
          <span className='text-sm'>
            Buscar por aluno, plano ou vencimento...
          </span>
        </div>
      </div>

      <div className='mt-6 overflow-hidden rounded-2xl border border-white/10'>
        <div className='grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_160px] border-b border-white/10 bg-zinc-900 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-zinc-400'>
          <span>Aluno</span>
          <span>Plano</span>
          <span>Vencimento</span>
          <span>Pago no mês</span>
          <span>Em aberto</span>
          <span>Ação</span>
        </div>

        <div className='divide-y divide-white/10'>
          {rows.length === 0 ? (
            <div className='px-6 py-12 text-center text-sm text-zinc-500'>
              Nenhuma fatura encontrada para este filtro.
            </div>
          ) : (
            rows.map((row) => (
              <div
                key={row.invoiceId}
                className='grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_160px] items-center px-6 py-5 text-sm text-white'
              >
                <div className='space-y-1'>
                  <p className='font-semibold text-white'>{row.student}</p>
                  <Badge className={`w-fit ${getStatusClasses(row.status)}`}>
                    {row.status}
                  </Badge>
                </div>

                <span className='text-zinc-300'>{row.plan}</span>
                <span className='text-zinc-300'>{row.dueDate}</span>
                <span className='text-zinc-300'>{row.paidInMonth}</span>
                <span className='text-zinc-300'>{row.pending}</span>

                <div>
                  {row.status !== 'Pago' ? (
                    <RegisterPaymentDialog
                      invoiceId={row.invoiceId}
                      amountInCents={row.amountInCents}
                      studentName={row.student}
                      dueDate={row.dueDate}
                      trigger={
                        <button className='rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20'>
                          Registrar
                        </button>
                      }
                    />
                  ) : (
                    <span className='text-xs text-zinc-500'>—</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};
