import { createPlanAction } from '@/modules/finance/actions/create-plan';
import { PlanCreateForm } from '@/modules/finance/components/plan-create-form';

export default async function AdminNovoPlanoPage() {
  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
            Financeiro
          </p>

          <h1 className='text-3xl font-bold tracking-tight'>Novo plano</h1>

          <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
            Crie um plano de cobrança para vincular aos alunos da academia.
            Defina o nome, valor e periodicidade.
          </p>
        </div>
      </section>

      <PlanCreateForm onSubmitAction={createPlanAction} />
    </div>
  );
}
