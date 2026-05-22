'use client';

import Link from 'next/link';
import { ChevronRight, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import type { PlanRow } from '@/modules/finance/queries/get-plans-list';

type PlansListTableProps = {
  plans: PlanRow[];
};

type PlanMobileCardProps = {
  plan: PlanRow;
};

const PlanStatusBadge = ({ active }: { active: boolean }) => (
  <Badge
    className={`w-fit shrink-0 ${
      active
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
        : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
    }`}
  >
    {active ? 'Ativo' : 'Inativo'}
  </Badge>
);

const PlanMobileCard = ({ plan }: PlanMobileCardProps) => {
  return (
    <Link
      href={`/admin/financeiro/planos/${plan.id}`}
      className='block rounded-xl border border-white/10 bg-zinc-950 p-4 transition hover:border-red-500/30 hover:bg-zinc-900/60'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <p className='truncate font-semibold text-white'>{plan.name}</p>
          {plan.description ? (
            <p className='mt-0.5 line-clamp-2 text-sm text-zinc-400'>
              {plan.description}
            </p>
          ) : null}
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <PlanStatusBadge active={plan.active} />
          <ChevronRight className='h-4 w-4 text-zinc-500' />
        </div>
      </div>

      <dl className='mt-3 grid grid-cols-3 gap-2 border-t border-white/5 pt-3 text-xs'>
        <div className='min-w-0'>
          <dt className='text-zinc-500'>Valor</dt>
          <dd className='mt-0.5 truncate font-medium text-zinc-300'>
            {plan.priceLabel}
          </dd>
        </div>

        <div className='min-w-0 text-center'>
          <dt className='text-zinc-500'>Periodicidade</dt>
          <dd className='mt-0.5 truncate font-medium text-zinc-300'>
            {plan.billingCycleLabel}
          </dd>
        </div>

        <div className='min-w-0 text-right'>
          <dt className='text-zinc-500'>Alunos</dt>
          <dd className='mt-0.5 font-medium text-zinc-300'>
            {plan.activeSubscriptions}
          </dd>
        </div>
      </dl>
    </Link>
  );
};

export const PlansListTable = ({ plans }: PlansListTableProps) => {
  const emptyMessage = (
    <p className='py-10 text-center text-sm text-zinc-400'>
      Nenhum plano cadastrado ainda.
    </p>
  );

  return (
    <div className='min-w-0 space-y-4'>
      {/* Mobile: cards */}
      <section className='space-y-3 md:hidden'>
        {plans.length > 0
          ? plans.map((plan) => <PlanMobileCard key={plan.id} plan={plan} />)
          : emptyMessage}
      </section>

      {/* Desktop: tabela */}
      <section className='hidden overflow-hidden rounded-2xl border border-white/10 md:block'>
        <table className='w-full border-collapse'>
          <thead className='bg-zinc-900/70'>
            <tr className='border-b border-white/10 text-left'>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Plano
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Valor
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Periodicidade
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Alunos ativos
              </th>
              <th className='px-5 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400'>
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {plans.length > 0 ? (
              plans.map((plan) => (
                <tr
                  key={plan.id}
                  className='border-b border-white/10 transition hover:bg-zinc-900/40'
                >
                  <td className='px-5 py-4 align-top'>
                    <Link
                      href={`/admin/financeiro/planos/${plan.id}`}
                      className='block space-y-1 transition hover:text-red-400'
                    >
                      <p className='font-semibold text-white'>{plan.name}</p>
                      {plan.description ? (
                        <p className='text-sm text-zinc-400'>
                          {plan.description}
                        </p>
                      ) : null}
                    </Link>
                  </td>

                  <td className='px-5 py-4 text-sm font-semibold text-white'>
                    {plan.priceLabel}
                  </td>

                  <td className='px-5 py-4 text-sm text-zinc-300'>
                    {plan.billingCycleLabel}
                  </td>

                  <td className='px-5 py-4 text-sm text-zinc-300'>
                    <div className='flex items-center gap-2'>
                      <Users className='h-4 w-4 text-zinc-500' />
                      {plan.activeSubscriptions}
                    </div>
                  </td>

                  <td className='px-5 py-4'>
                    <PlanStatusBadge active={plan.active} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};
