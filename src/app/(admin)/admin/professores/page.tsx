import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { InstructorsSummaryCards } from '@/modules/instructors/components/instructors-summary-cards';
import { InstructorsTable } from '@/modules/instructors/components/instructors-table';
import { getInstructorsList } from '@/modules/instructors/queries/get-instructors-list';
import { getInstructorsSummary } from '@/modules/instructors/queries/get-instructors-summary';

export default async function AdminProfessoresPage() {
  const [instructors, summary] = await Promise.all([
    getInstructorsList(),
    getInstructorsSummary(),
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
              Gestão de professores
            </h1>

            <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
              Aqui você gerencia os professores da academia, acompanha status e
              prepara o vínculo deles com as turmas do sistema.
            </p>
          </div>

          <Button
            asChild
            className='bg-red-600 text-white hover:bg-red-500 lg:w-auto'
          >
            <Link href='/admin/professores/novo'>
              <Plus className='mr-2 h-4 w-4' />
              Novo professor
            </Link>
          </Button>
        </div>
      </section>

      <InstructorsSummaryCards summary={summary} />

      <InstructorsTable instructors={instructors} />
    </div>
  );
}
