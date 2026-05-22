'use client';

import type { FinanceReportByPlan } from '@/modules/finance/queries/get-finance-reports';

type FinanceReportByPlanTableProps = {
  rows: FinanceReportByPlan[];
};

type FinanceReportByPlanMobileCardProps = {
  row: FinanceReportByPlan;
};

const FinanceReportByPlanMobileCard = ({
  row,
}: FinanceReportByPlanMobileCardProps) => {
  return (
    <article className='rounded-xl border border-white/10 bg-zinc-950 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <p className='min-w-0 flex-1 truncate font-semibold text-white'>
          {row.planName}
        </p>

        <span
          className={`shrink-0 text-sm font-semibold ${
            row.adimplencyRate >= 80 ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {row.adimplencyRate}%
        </span>
      </div>

      <dl className='mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-xs'>
        <div className='min-w-0'>
          <dt className='text-zinc-500'>Faturas</dt>
          <dd className='mt-0.5 font-medium text-zinc-300'>
            {row.totalInvoices}
          </dd>
        </div>

        <div className='min-w-0 text-center'>
          <dt className='text-zinc-500'>Pagas</dt>
          <dd className='mt-0.5 font-medium text-zinc-300'>
            {row.paidInvoices}
          </dd>
        </div>

        <div className='min-w-0 text-right'>
          <dt className='text-zinc-500'>Receita</dt>
          <dd className='mt-0.5 truncate font-medium text-emerald-400'>
            {row.revenueLabel}
          </dd>
        </div>
      </dl>
    </article>
  );
};

export const FinanceReportByPlanTable = ({
  rows,
}: FinanceReportByPlanTableProps) => {
  return (
    <div className='min-w-0'>
      {/* Mobile: cards */}
      <div className='space-y-3 md:hidden'>
        {rows.map((row) => (
          <FinanceReportByPlanMobileCard key={row.planName} row={row} />
        ))}
      </div>

      {/* Desktop: tabela */}
      <div className='hidden overflow-hidden rounded-2xl border border-white/10 md:block'>
        <table className='w-full border-collapse'>
          <thead className='bg-zinc-900/70'>
            <tr className='border-b border-white/10 text-left'>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Plano
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Faturas
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Pagas
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Adimplência
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Receita
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.planName}
                className='border-b border-white/10 transition hover:bg-zinc-900/40'
              >
                <td className='px-5 py-4 text-sm font-semibold text-white'>
                  {row.planName}
                </td>
                <td className='px-5 py-4 text-sm text-zinc-300'>
                  {row.totalInvoices}
                </td>
                <td className='px-5 py-4 text-sm text-zinc-300'>
                  {row.paidInvoices}
                </td>
                <td
                  className={`px-5 py-4 text-sm font-medium ${
                    row.adimplencyRate >= 80
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {row.adimplencyRate}%
                </td>
                <td className='px-5 py-4 text-sm font-semibold text-emerald-400'>
                  {row.revenueLabel}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
