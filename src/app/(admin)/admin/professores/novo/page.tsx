import { InstructorCreateForm } from '@/modules/instructors/components/instructor-create-form';

export default function AdminNovoProfessorPage() {
  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
            Cadastro
          </p>

          <h1 className='text-3xl font-bold tracking-tight'>Novo professor</h1>

          <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
            Aqui você cadastra um novo professor para depois vincular às turmas
            da academia e permitir o gerenciamento operacional.
          </p>
        </div>
      </section>

      <InstructorCreateForm />
    </div>
  );
}
