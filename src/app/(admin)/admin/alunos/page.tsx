import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { StudentSummaryCards } from '@/modules/students/components/student-summary-cards';
import { StudentsTable } from '@/modules/students/components/students-table';
import { getStudentsList } from '@/modules/students/queries/get-students-list';

export default async function AdminAlunosPage() {
  const students = await getStudentsList();

  return (
    <div className='space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
              Módulo
            </p>

            <h1 className='text-3xl font-bold tracking-tight'>
              Gestão de alunos
            </h1>

            <p className='max-w-3xl text-sm leading-6 text-zinc-400'>
              Agora a listagem já usa dados reais do banco. A próxima evolução
              será transformar os cards de resumo em indicadores reais e abrir o
              fluxo de visualização detalhada do aluno.
            </p>
          </div>

          <Button
            asChild
            className='bg-red-600 text-white hover:bg-red-500 lg:w-auto'
          >
            <Link href='/admin/alunos/novo'>
              <Plus className='mr-2 h-4 w-4' />
              Novo aluno
            </Link>
          </Button>
        </div>
      </section>

      <StudentSummaryCards />

      <StudentsTable students={students} />
    </div>
  );
}
