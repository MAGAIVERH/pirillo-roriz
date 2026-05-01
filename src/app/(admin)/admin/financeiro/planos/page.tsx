import Link from 'next/link';
import { Plus, Users } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPlansList } from '@/modules/finance/queries/get-plans-list';

export default async function AdminFinanceiroPlanoPage() {
  const plans = await getPlansList();

  return (
    <div className='space-y-6'>
      {/* Cabeçalho */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
              Financeiro
            </p>

            <h1 className='text-3xl font-bold tracking-tight'>Planos</h1>

            <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
              Gerencie os planos disponíveis na academia. Cada plano define o
              valor, a periodicidade de cobrança e pode ser vinculado a um ou
              mais alunos.
            </p>
          </div>

          <Button
            asChild
            className='bg-red-600 text-white hover:bg-red-500 lg:w-auto'
          >
            <Link href='/admin/financeiro/planos/novo'>
              <Plus className='mr-2 h-4 w-4' />
              Novo plano
            </Link>
          </Button>
        </div>
      </section>

      {/* Listagem */}
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='overflow-hidden rounded-2xl border border-white/10'>
          {/* Cabeçalho da tabela */}
          <div className='grid grid-cols-[1.5fr_1fr_1fr_1fr_120px] border-b border-white/10 bg-zinc-900 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-zinc-400'>
            <span>Plano</span>
            <span>Valor</span>
            <span>Periodicidade</span>
            <span>Alunos ativos</span>
            <span>Status</span>
          </div>

          {/* Linhas */}
          <div className='divide-y divide-white/10'>
            {plans.length === 0 ? (
              <div className='px-6 py-12 text-center text-sm text-zinc-500'>
                Nenhum plano cadastrado ainda.{' '}
                <Link
                  href='/admin/financeiro/planos/novo'
                  className='text-red-400 underline underline-offset-4 hover:text-red-300'
                >
                  Criar o primeiro plano
                </Link>
              </div>
            ) : (
              plans.map((plan) => (
                <Link
                  key={plan.id}
                  href={`/admin/financeiro/planos/${plan.id}`}
                  className='grid grid-cols-[1.5fr_1fr_1fr_1fr_120px] items-center px-6 py-5 text-sm text-white transition hover:bg-zinc-900'
                >
                  <div className='space-y-1'>
                    <p className='font-semibold text-white'>{plan.name}</p>
                    {plan.description && (
                      <p className='text-zinc-400'>{plan.description}</p>
                    )}
                  </div>

                  <span className='font-semibold text-white'>
                    {plan.priceLabel}
                  </span>

                  <span className='text-zinc-300'>
                    {plan.billingCycleLabel}
                  </span>

                  <div className='flex items-center gap-2 text-zinc-300'>
                    <Users className='h-4 w-4 text-zinc-500' />
                    {plan.activeSubscriptions}
                  </div>

                  <div>
                    <Badge
                      className={
                        plan.active
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
                      }
                    >
                      {plan.active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
