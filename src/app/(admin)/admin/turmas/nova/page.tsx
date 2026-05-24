import { AdminBackButton } from '@/components/layout/admin-back-button';
import { ClassCreateForm } from '@/modules/classes/components/class-create-form';
import { getActiveInstructorsOptions } from '@/modules/instructors/queries/get-active-instructors-options';

export default async function AdminNovaTurmaPage() {
  const availableProfessors = await getActiveInstructorsOptions();

  return (
    <div className='min-w-0 space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='space-y-4'>
          <AdminBackButton href='/admin/turmas' label='Voltar para turmas' />

          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
              Cadastro
            </p>

            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Nova turma
            </h1>

            <p className='max-w-3xl text-sm leading-6 wrap-break-word text-zinc-400'>
              Aqui você cria a turma completa, já definindo nome, tipo,
              capacidade, professor responsável e horários iniciais.
            </p>
          </div>
        </div>
      </section>

      <ClassCreateForm availableProfessors={availableProfessors} />
    </div>
  );
}
