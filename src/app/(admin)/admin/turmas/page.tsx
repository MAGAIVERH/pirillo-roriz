import { ClassesSummaryCards } from '@/modules/classes/components/classes-summary-cards';
import { ClassesTable } from '@/modules/classes/components/classes-table';
import { getClassesList } from '@/modules/classes/queries/get-classes-list';
import { getClassesSummary } from '@/modules/classes/queries/get-classes-summary';

export default async function AdminTurmasPage() {
  const [classes, summary] = await Promise.all([
    getClassesList(),
    getClassesSummary(),
  ]);

  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
            Módulo
          </p>

          <h1 className='text-3xl font-bold tracking-tight'>
            Turmas e horários
          </h1>

          <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
            Aqui começamos a estrutura real do módulo de turmas com dados do
            banco. O próximo passo será abrir cadastro e edição de horários,
            capacidade e vínculo com professor.
          </p>
        </div>
      </section>

      <ClassesSummaryCards summary={summary} />

      <ClassesTable classes={classes} />
    </div>
  );
}
