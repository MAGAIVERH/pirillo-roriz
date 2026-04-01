import { StudentCreateForm } from '@/modules/students/components/student-create-form';

export default function AdminNovoAlunoPage() {
  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='space-y-2'>
          <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
            Cadastro
          </p>

          <h1 className='text-3xl font-bold tracking-tight'>Novo aluno</h1>

          <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
            Aqui começamos a estrutura do cadastro de aluno. Nesta etapa, vamos
            montar a base visual do formulário antes de conectar com validação,
            server actions e persistência real.
          </p>
        </div>
      </section>

      <StudentCreateForm />
    </div>
  );
}
