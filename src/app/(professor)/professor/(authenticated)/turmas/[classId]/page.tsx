import { AdminBackButton } from '@/components/layout/admin-back-button';
import { Badge } from '@/components/ui/badge';
import { requireInstructorContext } from '@/lib/session-context';
import { InstructorClassStudentsList } from '@/modules/instructor-portal/components/instructor-class-students-list';
import { getInstructorClassDetail } from '@/modules/instructor-portal/queries/get-instructor-class-detail';

type ProfessorClassDetailPageProps = {
  params: Promise<{
    classId: string;
  }>;
};

export default async function ProfessorClassDetailPage({
  params,
}: ProfessorClassDetailPageProps) {
  const { instructor } = await requireInstructorContext();
  const { classId } = await params;
  const classDetail = await getInstructorClassDetail(instructor.id, classId);

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
        <div className="space-y-4">
          <AdminBackButton href="/professor/turmas" label="Voltar para turmas" />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
                Turma
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {classDetail.name}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-zinc-400">
                {classDetail.description}
              </p>
            </div>

            <Badge
              variant="outline"
              className={
                classDetail.active
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
              }
            >
              {classDetail.active ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-400">Tipo</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {classDetail.type}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-400">Capacidade</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {classDetail.capacityLabel}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-400">Alunos matriculados</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {classDetail.enrollmentsCount}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
          <p className="text-sm text-zinc-400">Horários</p>
          <p className="mt-2 text-sm font-medium text-white">
            {classDetail.schedules.length > 0
              ? classDetail.schedules
                  .map(
                    (schedule) =>
                      `${schedule.weekDayLabel} ${schedule.startTime}–${schedule.endTime}`,
                  )
                  .join(' · ')
              : 'Sem horários'}
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Alunos da turma</h2>
          <p className="text-sm text-zinc-400">
            Clique em um aluno para ver frequência e lançar presença.
          </p>
        </div>

        <InstructorClassStudentsList
          classId={classDetail.id}
          students={classDetail.students}
        />
      </section>
    </div>
  );
}
