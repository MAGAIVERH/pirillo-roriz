'use client';

import { Badge } from '@/components/ui/badge';
import type { FinanceReportPaymentRow } from '@/modules/finance/queries/get-finance-reports';

type FinanceReportPaymentsTableProps = {
  rows: FinanceReportPaymentRow[];
  emptyMessage: string;
};

type FinanceReportPaymentMobileCardProps = {
  row: FinanceReportPaymentRow;
};

const METHOD_COLORS: Record<string, string> = {
  PIX: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  CASH: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  CARD: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
  BANK_TRANSFER: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
};

const PaymentMethodBadge = ({ row }: { row: FinanceReportPaymentRow }) => (
  <Badge
    className={`w-fit shrink-0 ${
      METHOD_COLORS[row.method] ??
      'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
    }`}
  >
    {row.methodLabel}
  </Badge>
);

const FinanceReportPaymentMobileCard = ({
  row,
}: FinanceReportPaymentMobileCardProps) => {
  return (
    <article className='rounded-xl border border-white/10 bg-zinc-950 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-semibold text-white'>{row.studentName}</p>
          <p className='mt-0.5 truncate text-sm text-zinc-400'>{row.planName}</p>
        </div>

        <PaymentMethodBadge row={row} />
      </div>

      <dl className='mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 text-xs'>
        <div className='min-w-0'>
          <dt className='text-zinc-500'>Valor</dt>
          <dd className='mt-0.5 truncate font-medium text-emerald-400'>
            {row.amountLabel}
          </dd>
        </div>

        <div className='min-w-0 text-right'>
          <dt className='text-zinc-500'>Data</dt>
          <dd className='mt-0.5 truncate font-medium text-zinc-300'>
            {row.paidAt}
          </dd>
        </div>
      </dl>
    </article>
  );
};

export const FinanceReportPaymentsTable = ({
  rows,
  emptyMessage,
}: FinanceReportPaymentsTableProps) => {
  const emptyContent = (
    <p className='py-10 text-center text-sm text-zinc-400'>{emptyMessage}</p>
  );

  return (
    <div className='min-w-0'>
      {/* Mobile: cards */}
      <div className='space-y-3 md:hidden'>
        {rows.length > 0
          ? rows.map((row) => (
              <FinanceReportPaymentMobileCard key={row.paymentId} row={row} />
            ))
          : emptyContent}
      </div>

      {/* Desktop: tabela */}
      <div className='hidden overflow-hidden rounded-2xl border border-white/10 md:block'>
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
                Valor
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Forma
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Data
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.paymentId}
                  className='border-b border-white/10 transition hover:bg-zinc-900/40'
                >
                  <td className='px-5 py-4 text-sm font-semibold text-white'>
                    {row.studentName}
                  </td>
                  <td className='px-5 py-4 text-sm text-zinc-300'>
                    {row.planName}
                  </td>
                  <td className='px-5 py-4 text-sm font-semibold text-emerald-400'>
                    {row.amountLabel}
                  </td>
                  <td className='px-5 py-4'>
                    <PaymentMethodBadge row={row} />
                  </td>
                  <td className='px-5 py-4 text-sm text-zinc-300'>
                    {row.paidAt}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>{emptyContent}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
