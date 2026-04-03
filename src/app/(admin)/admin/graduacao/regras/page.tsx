import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { GraduationRulesSummaryCards } from '@/modules/graduation-rules/components/graduation-rules-summary-cards';
import { GraduationRulesTable } from '@/modules/graduation-rules/components/graduation-rules-table';
import { getGraduationRulesList } from '@/modules/graduation-rules/queries/get-graduation-rules-list';
import { getGraduationRulesSummary } from '@/modules/graduation-rules/queries/get-graduation-rules-summary';

export default async function AdminGraduationRulesPage() {
  const [rules, summary] = await Promise.all([
    getGraduationRulesList(),
    getGraduationRulesSummary(),
  ]);

  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
              Módulo
            </p>

            <h1 className='text-3xl font-bold tracking-tight'>
              Regras de graduação
            </h1>

            <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
              Aqui você gerencia as regras usadas para projetar elegibilidade,
              evolução de faixa e progresso do aluno.
            </p>
          </div>

          <Button
            asChild
            className='bg-red-600 text-white hover:bg-red-500 lg:w-auto'
          >
            <Link href='/admin/graduacao/regras/nova'>
              <Plus className='mr-2 h-4 w-4' />
              Nova regra
            </Link>
          </Button>
        </div>
      </section>

      <GraduationRulesSummaryCards summary={summary} />

      <GraduationRulesTable rules={rules} />
    </div>
  );
}
