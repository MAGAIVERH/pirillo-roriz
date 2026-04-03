import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { ClassCreateForm } from '@/modules/classes/components/class-create-form';

export default async function AdminNovaTurmaPage() {
  const academy = await getOrCreateDefaultAcademy();

  const availableProfessors = await db.instructor.findMany({
    where: {
      academyId: academy.id,
      active: true,
    },
    orderBy: {
      fullName: 'asc',
    },
    select: {
      id: true,
      fullName: true,
    },
  });

  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
            Cadastro
          </p>

          <h1 className='text-3xl font-bold tracking-tight'>Nova turma</h1>

          <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
            Aqui você cria a turma completa, já definindo nome, tipo,
            capacidade, professor responsável e horários iniciais.
          </p>
        </div>
      </section>

      <ClassCreateForm availableProfessors={availableProfessors} />
    </div>
  );
}
