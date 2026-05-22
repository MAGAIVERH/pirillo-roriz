import { AdminBackButton } from '@/components/layout/admin-back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { getGraduationRuleById } from '@/modules/graduation-rules/queries/get-graduation-rule-by-id';
import { GraduationRuleDetailsForm } from '@/modules/graduation-rules/components/graduation-rule-datails-form';

type AdminGraduationRuleDetailsPageProps = {
  params: Promise<{
    ruleId: string;
  }>;
};

export default async function AdminGraduationRuleDetailsPage({
  params,
}: AdminGraduationRuleDetailsPageProps) {
  const { ruleId } = await params;
  const { rule, belts } = await getGraduationRuleById(ruleId);

  return (
    <div className='min-w-0 space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-4'>
            <AdminBackButton
              href='/admin/graduacao/regras'
              label='Voltar para regras'
            />

            <div className='space-y-2'>
              <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
                Detalhes da regra
              </p>

              <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                {rule.currentStepLabel} → {rule.nextStepLabel}
              </h1>

              <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
                Aqui você edita a regra de progressão e controla se ela fica
                ativa ou inativa no cálculo de elegibilidade.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Programa</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>
              {rule.program === 'KIDS' ? 'Kids' : 'Adulto'}
            </p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Tempo mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{rule.minimumMonths} meses</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>
              {rule.status === 'ACTIVE' ? 'Ativa' : 'Inativa'}
            </p>
          </CardContent>
        </Card>
      </section>

      <GraduationRuleDetailsForm rule={rule} belts={belts} />
    </div>
  );
}
