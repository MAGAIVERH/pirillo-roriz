import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-3'>
            <Button
              asChild
              variant='outline'
              className='border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white'
            >
              <Link href='/admin/graduacao/regras'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Voltar para regras
              </Link>
            </Button>

            <div className='space-y-2'>
              <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
                Detalhes da regra
              </p>

              <h1 className='text-3xl font-bold tracking-tight'>
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
