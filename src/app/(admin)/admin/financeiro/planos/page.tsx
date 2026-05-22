import Link from 'next/link';
import { Plus } from 'lucide-react';

import { AdminBackButton } from '@/components/layout/admin-back-button';
import { Button } from '@/components/ui/button';
import { PlansListTable } from '@/modules/finance/components/plans-list-table';
import { getPlansList } from '@/modules/finance/queries/get-plans-list';

export default async function AdminFinanceiroPlanoPage() {
  const plans = await getPlansList();

  return (
    <div className='min-w-0 space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-4'>
            <AdminBackButton
              href='/admin/financeiro'
              label='Voltar ao financeiro'
            />

            <div className='space-y-2'>
              <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
                Financeiro
              </p>
              <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                Planos
              </h1>
              <p className='max-w-3xl text-sm leading-6 break-words text-zinc-400'>
                Gerencie os planos disponíveis na academia. Cada plano define o
                valor, a periodicidade de cobrança e pode ser vinculado a um ou
                mais alunos.
              </p>
            </div>
          </div>

          <Button
            asChild
            className='w-full bg-red-600 text-white hover:bg-red-500 sm:w-auto'
          >
            <Link href='/admin/financeiro/planos/novo'>
              <Plus className='mr-2 h-4 w-4' />
              Novo plano
            </Link>
          </Button>
        </div>
      </section>

      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        {plans.length === 0 ? (
          <div className='py-10 text-center text-sm text-zinc-500'>
            Nenhum plano cadastrado ainda.{' '}
            <Link
              href='/admin/financeiro/planos/novo'
              className='text-red-400 underline underline-offset-4 hover:text-red-300'
            >
              Criar o primeiro plano
            </Link>
          </div>
        ) : (
          <PlansListTable plans={plans} />
        )}
      </section>
    </div>
  );
}
