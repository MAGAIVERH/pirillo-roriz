import { AdminBackButton } from '@/components/layout/admin-back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassScheduleManager } from '@/modules/classes/components/class-schedule-manager';
import { getClassById } from '@/modules/classes/queries/get-class-by-id';

type AdminClassDetailsPageProps = {
  params: Promise<{
    classId: string;
  }>;
};

export default async function AdminClassDetailsPage({
  params,
}: AdminClassDetailsPageProps) {
  const { classId } = await params;
  const foundClass = await getClassById(classId);

  return (
    <div className='min-w-0 space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-4'>
            <AdminBackButton href='/admin/turmas' label='Voltar para turmas' />

            <div className='space-y-2'>
              <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
                Detalhes da turma
              </p>

              <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                {foundClass.name}
              </h1>

              <p className='max-w-3xl text-sm leading-6 break-words text-zinc-400'>
                Aqui vamos gerenciar os horários da turma e preparar a base para
                presença, sessões de aula e check-in.
              </p>
            </div>
          </div>

          <span
            className={`inline-flex w-24 justify-center rounded-full border px-3 py-1 text-xs font-medium ${
              foundClass.active
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-300'
            }`}
          >
            {foundClass.active ? 'Ativa' : 'Inativa'}
          </span>
        </div>
      </section>

      <section className='grid gap-4 xl:grid-cols-4'>
        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{foundClass.type}</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Professor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{foundClass.instructor}</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Capacidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{foundClass.capacityLabel}</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Alunos ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>
              {foundClass.enrollmentsCount}
            </p>
          </CardContent>
        </Card>
      </section>

      <ClassScheduleManager
        classId={foundClass.id}
        currentName={foundClass.name}
        currentTypeName={foundClass.type}
        currentCapacity={foundClass.capacity}
        currentInstructorId={foundClass.instructorId}
        availableInstructors={foundClass.availableInstructors}
        schedules={foundClass.schedules}
      />
    </div>
  );
}
