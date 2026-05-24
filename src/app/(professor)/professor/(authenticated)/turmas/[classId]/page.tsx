import {
  CalendarDays,
  Layers,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { AdminBackButton } from '@/components/layout/admin-back-button';
import { requireInstructorContext } from '@/lib/session-context';
import {
  InstructorClassSchedulesSection,
  InstructorClassStudentsList,
} from '@/modules/instructor-portal/components/instructor-class-students-list';
import { getInstructorClassDetail } from '@/modules/instructor-portal/queries/get-instructor-class-detail';
import { StudentDetailInfoCard } from '@/modules/students/components/student-detail-info-card';

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <AdminBackButton href="/professor/turmas" label="Voltar para turmas" />

            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
                Detalhes da turma
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {classDetail.name}
              </h1>
              <p className="max-w-3xl text-sm leading-6 wrap-break-word text-zinc-400">
                {classDetail.description}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
              classDetail.active
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                : 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
            }`}
          >
            {classDetail.active ? 'Ativa' : 'Inativa'}
          </span>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StudentDetailInfoCard
          title="Tipo"
          value={classDetail.type}
          icon={Layers}
        />
        <StudentDetailInfoCard
          title="Capacidade"
          value={classDetail.capacityLabel}
          icon={Users}
        />
        <StudentDetailInfoCard
          title="Alunos matriculados"
          value={String(classDetail.enrollmentsCount)}
          icon={CalendarDays}
        />
        <StudentDetailInfoCard
          title="Situação"
          value={classDetail.active ? 'Ativa' : 'Inativa'}
          icon={ShieldCheck}
        />
      </section>

      <InstructorClassSchedulesSection schedules={classDetail.schedules} />

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Alunos da turma</h2>
            <p className="text-sm text-zinc-400">
              Clique em um aluno para ver frequência e lançar presença.
            </p>
          </div>
        </div>

        <InstructorClassStudentsList
          classId={classDetail.id}
          students={classDetail.students}
        />
      </section>
    </div>
  );
}
