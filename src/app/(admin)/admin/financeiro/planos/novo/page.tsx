import { AdminBackButton } from '@/components/layout/admin-back-button';
import { createPlanAction } from '@/modules/finance/actions/create-plan';
import { PlanCreateForm } from '@/modules/finance/components/plan-create-form';

export default async function AdminNovoPlanoPage() {
  return (
    <div className='min-w-0 space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='space-y-4'>
          <AdminBackButton
            href='/admin/financeiro/planos'
            label='Voltar para planos'
          />

          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
              Financeiro
            </p>

            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Novo plano
            </h1>

            <p className='max-w-3xl text-sm leading-6 break-words text-zinc-400'>
              Crie um plano de cobrança para vincular aos alunos da academia.
              Defina o nome, valor e periodicidade.
            </p>
          </div>
        </div>
      </section>

      <PlanCreateForm onSubmitAction={createPlanAction} />
    </div>
  );
}
