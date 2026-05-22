'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { RegisterPaymentDialog } from '@/modules/finance/components/register-payment-dialog';
import type { FinanceReceivableRow } from '@/modules/finance/queries/finance-dashboard-queries';

type FinanceReceivablesTableProps = {
  rows: FinanceReceivableRow[];
  title: string;
  description: string;
};

type FinanceReceivableMobileCardProps = {
  row: FinanceReceivableRow;
};

const getStatusClasses = (status: FinanceReceivableRow['status']) => {
  if (status === 'Pago') {
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
  }
  if (status === 'Vencido') {
    return 'border-red-500/20 bg-red-500/10 text-red-400';
  }
  return 'border-amber-500/20 bg-amber-500/10 text-amber-400';
};

const FinanceStatusBadge = ({ status }: { status: FinanceReceivableRow['status'] }) => (
  <Badge className={`w-fit shrink-0 ${getStatusClasses(status)}`}>
    {status}
  </Badge>
);

const RegisterPaymentButton = ({ row }: { row: FinanceReceivableRow }) => {
  if (row.status === 'Pago') {
    return null;
  }

  return (
    <RegisterPaymentDialog
      invoiceId={row.invoiceId}
      amountInCents={row.amountInCents}
      studentName={row.student}
      dueDate={row.dueDate}
      trigger={
        <button
          type='button'
          className='w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 sm:w-auto sm:py-1.5'
        >
          Registrar pagamento
        </button>
      }
    />
  );
};

const FinanceReceivableMobileCard = ({ row }: FinanceReceivableMobileCardProps) => {
  return (
    <article className='rounded-xl border border-white/10 bg-zinc-950 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-semibold text-white'>{row.student}</p>
          <p className='mt-0.5 truncate text-sm text-zinc-400'>{row.plan}</p>
        </div>

        <FinanceStatusBadge status={row.status} />
      </div>

      <dl className='mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-xs'>
        <div className='min-w-0'>
          <dt className='text-zinc-500'>Vencimento</dt>
          <dd className='mt-0.5 truncate font-medium text-zinc-300'>
            {row.dueDate}
          </dd>
        </div>

        <div className='min-w-0 text-center'>
          <dt className='text-zinc-500'>Pago no mês</dt>
          <dd className='mt-0.5 truncate font-medium text-zinc-300'>
            {row.paidInMonth}
          </dd>
        </div>

        <div className='min-w-0 text-right'>
          <dt className='text-zinc-500'>Em aberto</dt>
          <dd className='mt-0.5 truncate font-medium text-zinc-300'>
            {row.pending}
          </dd>
        </div>
      </dl>

      {row.status !== 'Pago' ? (
        <div className='mt-3 border-t border-white/5 pt-3'>
          <RegisterPaymentButton row={row} />
        </div>
      ) : null}
    </article>
  );
};

export const FinanceReceivablesTable = ({
  rows,
  title,
  description,
}: FinanceReceivablesTableProps) => {
  const [search, setSearch] = useState('');

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter((row) => {
      return (
        row.student.toLowerCase().includes(normalizedSearch) ||
        row.plan.toLowerCase().includes(normalizedSearch) ||
        row.dueDate.toLowerCase().includes(normalizedSearch) ||
        row.status.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [rows, search]);

  const emptyMessage = (
    <p className='py-10 text-center text-sm text-zinc-400'>
      Nenhuma fatura encontrada para este filtro.
    </p>
  );

  return (
    <section
      id='tabela'
      className='min-w-0 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'
    >
      <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='min-w-0 space-y-1'>
          <h2 className='text-xl font-semibold text-white sm:text-2xl'>
            {title}
          </h2>
          <p className='text-sm text-zinc-400'>{description}</p>
        </div>

        <div className='flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 text-zinc-400 lg:max-w-sm'>
          <Search className='h-4 w-4 shrink-0' />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Buscar por aluno, plano ou vencimento...'
            className='w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500'
          />
        </div>
      </div>

      {/* Mobile: cards */}
      <div className='mt-6 space-y-3 md:hidden'>
        {filteredRows.length > 0
          ? filteredRows.map((row) => (
              <FinanceReceivableMobileCard key={row.invoiceId} row={row} />
            ))
          : emptyMessage}
      </div>

      {/* Desktop: tabela */}
      <div className='mt-6 hidden overflow-hidden rounded-2xl border border-white/10 md:block'>
        <table className='w-full border-collapse'>
          <thead className='bg-zinc-900/70'>
            <tr className='border-b border-white/10 text-left'>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Aluno
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Plano
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Vencimento
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Pago no mês
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Em aberto
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Ação
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <tr
                  key={row.invoiceId}
                  className='border-b border-white/10 transition hover:bg-zinc-900/40'
                >
                  <td className='px-5 py-4 align-top'>
                    <div className='space-y-2'>
                      <p className='font-semibold text-white'>{row.student}</p>
                      <FinanceStatusBadge status={row.status} />
                    </div>
                  </td>

                  <td className='px-5 py-4 text-sm text-zinc-300'>{row.plan}</td>
                  <td className='px-5 py-4 text-sm text-zinc-300'>
                    {row.dueDate}
                  </td>
                  <td className='px-5 py-4 text-sm text-zinc-300'>
                    {row.paidInMonth}
                  </td>
                  <td className='px-5 py-4 text-sm text-zinc-300'>
                    {row.pending}
                  </td>

                  <td className='px-5 py-4'>
                    {row.status !== 'Pago' ? (
                      <RegisterPaymentDialog
                        invoiceId={row.invoiceId}
                        amountInCents={row.amountInCents}
                        studentName={row.student}
                        dueDate={row.dueDate}
                        trigger={
                          <button
                            type='button'
                            className='rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20'
                          >
                            Registrar
                          </button>
                        }
                      />
                    ) : (
                      <span className='text-xs text-zinc-500'>—</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
