import { requireInstructorContext } from '@/lib/session-context';
import { InstructorClassesTable } from '@/modules/instructor-portal/components/instructor-classes-table';
import { getInstructorClasses } from '@/modules/instructor-portal/queries/get-instructor-classes';

export default async function ProfessorClassesPage() {
  const { instructor } = await requireInstructorContext();
  const classes = await getInstructorClasses(instructor.id);

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Turmas
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Minhas turmas</h1>
        <p className="text-sm leading-7 text-zinc-400">
          Selecione uma turma para ver os alunos matriculados e lançar
          presenças.
        </p>
      </section>

      <InstructorClassesTable classes={classes} />
    </div>
  );
}
