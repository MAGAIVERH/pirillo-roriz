import { AdminBackButton } from '@/components/layout/admin-back-button';
import { InstructorCreateForm } from '@/modules/instructors/components/instructor-create-form';

export default function AdminNovoProfessorPage() {
  return (
    <div className='min-w-0 space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='space-y-4'>
          <AdminBackButton
            href='/admin/professores'
            label='Voltar para professores'
          />

          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
              Cadastro
            </p>

            <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
              Novo professor
            </h1>

            <p className='max-w-3xl text-sm leading-6 break-words text-zinc-400'>
              Aqui você cadastra um novo professor para depois vincular às turmas
              da academia e permitir o gerenciamento operacional.
            </p>
          </div>
        </div>
      </section>

      <InstructorCreateForm />
    </div>
  );
}
