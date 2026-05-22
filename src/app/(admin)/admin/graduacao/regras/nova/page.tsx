import { AdminBackButton } from '@/components/layout/admin-back-button';
import { GraduationRuleCreateForm } from '@/modules/graduation-rules/components/graduation-rule-create-form';
import { getGraduationRuleFormOptions } from '@/modules/graduation-rules/queries/get-graduation-rule-form-options';

export default async function AdminNovaRegraGraduacaoPage() {
  const belts = await getGraduationRuleFormOptions();

  return (
    <div className='min-w-0 space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='space-y-4'>
          <AdminBackButton
            href='/admin/graduacao/regras'
            label='Voltar para regras'
          />

          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
              Cadastro
            </p>

            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Nova regra de graduação
            </h1>

            <p className='max-w-3xl text-sm leading-6 break-words text-zinc-400'>
              Aqui você define a regra base para cálculo de elegibilidade,
              progressão e projeção de graduação.
            </p>
          </div>
        </div>
      </section>

      <GraduationRuleCreateForm belts={belts} />
    </div>
  );
}
