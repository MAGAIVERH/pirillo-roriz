import { StudentCreateForm } from '@/modules/students/components/student-create-form';
import { createStudentAction } from '@/modules/students/actions/create-student';

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
            Agora esta tela já salva o aluno de verdade no banco, incluindo
            faixa inicial, histórico de status e matrícula básica quando o
            status não for lead.
          </p>
        </div>
      </section>

      <StudentCreateForm onSubmitAction={createStudentAction} />
    </div>
  );
}
