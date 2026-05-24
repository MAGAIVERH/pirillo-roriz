import { requireInstructorContext } from '@/lib/session-context';
import { InstructorWarningsView } from '@/modules/instructor-portal/components/instructor-warnings-view';
import { getInstructorWarningsPage } from '@/modules/instructor-portal/queries/get-instructor-warnings-page';

export default async function ProfessorWarningsPage() {
  const { user, instructor } = await requireInstructorContext();
  const data = await getInstructorWarningsPage(instructor.id, user.id);

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Avisos
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Comunicados</h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-400">
          Acompanhe os avisos da academia e envie comunicados para seus alunos.
        </p>
      </section>

      <InstructorWarningsView
        academyWarnings={data.academyWarnings}
        myWarnings={data.myWarnings}
        classes={data.classes}
      />
    </div>
  );
}
