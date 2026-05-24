import Link from 'next/link';

import { requireInstructorContext } from '@/lib/session-context';
import { InstructorStudentsTable } from '@/modules/instructor-portal/components/instructor-students-table';
import {
  filterInstructorStudents,
  getInstructorStudents,
  type InstructorStudentFilter,
} from '@/modules/instructor-portal/queries/get-instructor-students';

const VALID_FILTERS: InstructorStudentFilter[] = [
  'todos',
  'aptos',
  'inadimplentes',
];

function isValidFilter(value: string | undefined): value is InstructorStudentFilter {
  return VALID_FILTERS.includes(value as InstructorStudentFilter);
}

type ProfessorStudentsPageProps = {
  searchParams: Promise<{
    filtro?: string;
  }>;
};

const filterMeta: Record<
  InstructorStudentFilter,
  { title: string; description: string; emptyMessage: string }
> = {
  todos: {
    title: 'Meus alunos',
    description:
      'Todos os alunos matriculados nas turmas vinculadas a você.',
    emptyMessage: 'Nenhum aluno matriculado nas suas turmas.',
  },
  aptos: {
    title: 'Alunos aptos a graduar',
    description:
      'Alunos que atingiram os critérios de graduação e aguardam registro pelo admin.',
    emptyMessage: 'Nenhum aluno apto a graduar no momento.',
  },
  inadimplentes: {
    title: 'Alunos inadimplentes',
    description:
      'Alunos com mensalidade em atraso. Podem treinar, mas não recebem presença.',
    emptyMessage: 'Nenhum aluno inadimplente nas suas turmas.',
  },
};

export default async function ProfessorStudentsPage({
  searchParams,
}: ProfessorStudentsPageProps) {
  const { instructor } = await requireInstructorContext();
  const { filtro } = await searchParams;
  const activeFilter: InstructorStudentFilter = isValidFilter(filtro)
    ? filtro
    : 'todos';

  const allStudents = await getInstructorStudents(instructor.id);
  const students = filterInstructorStudents(allStudents, activeFilter);
  const meta = filterMeta[activeFilter];

  const filterLinks: { label: string; value: InstructorStudentFilter }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Aptos a graduar', value: 'aptos' },
    { label: 'Inadimplentes', value: 'inadimplentes' },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Alunos
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{meta.title}</h1>
        <p className="text-sm leading-7 text-zinc-400">{meta.description}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {filterLinks.map((item) => {
            const isActive = activeFilter === item.value;

            return (
              <Link
                key={item.value}
                href={
                  item.value === 'todos'
                    ? '/professor/alunos'
                    : `/professor/alunos?filtro=${item.value}`
                }
                className={`inline-flex h-9 items-center rounded-xl border px-4 text-sm font-medium transition ${
                  isActive
                    ? 'border-red-500/40 bg-red-600/15 text-red-300'
                    : 'border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <InstructorStudentsTable
        students={students}
        emptyMessage={meta.emptyMessage}
      />
    </div>
  );
}
