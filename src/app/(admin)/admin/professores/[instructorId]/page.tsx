import { AdminBackButton } from '@/components/layout/admin-back-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InstructorDetailsForm } from '@/modules/instructors/components/instructor-details-form';
import { InstructorStatusBadge } from '@/modules/instructors/components/instructor-status-badge';
import { getInstructorById } from '@/modules/instructors/queries/get-instructor-by-id';

type AdminInstructorDetailsPageProps = {
  params: Promise<{
    instructorId: string;
  }>;
};

export default async function AdminInstructorDetailsPage({
  params,
}: AdminInstructorDetailsPageProps) {
  const { instructorId } = await params;
  const instructor = await getInstructorById(instructorId);

  return (
    <div className='min-w-0 space-y-6'>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6'>
        <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
          <div className='space-y-4'>
            <AdminBackButton
              href='/admin/professores'
              label='Voltar para professores'
            />

            <div className='space-y-2'>
              <p className='text-sm font-medium uppercase tracking-[0.18em] text-red-500'>
                Detalhes do professor
              </p>

              <h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>
                {instructor.fullName}
              </h1>

              <p className='max-w-3xl text-sm leading-6 break-words text-zinc-400'>
                Aqui você gerencia os dados do professor, acompanha status e
                prepara o vínculo operacional com as turmas da academia.
              </p>
            </div>
          </div>

          <InstructorStatusBadge
            status={instructor.active ? 'ACTIVE' : 'INACTIVE'}
          />
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Idade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>
              {instructor.age ? `${instructor.age} anos` : '-'}
            </p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Faixa atual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>
              {instructor.belt || '-'}
              {instructor.belt ? ` • Grau ${instructor.beltDegree}` : ''}
            </p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Turmas vinculadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{instructor.classesCount}</p>
          </CardContent>
        </Card>

        <Card className='border-white/10 bg-zinc-950 text-white'>
          <CardHeader>
            <CardTitle className='text-base'>Cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-zinc-300'>{instructor.createdAt}</p>
          </CardContent>
        </Card>
      </section>

      <InstructorDetailsForm instructor={instructor} />
    </div>
  );
}
