import { requireInstructorContext } from '@/lib/session-context';
import { InstructorDashboardShell } from '@/modules/instructor-portal/components/instructor-dashboard-shell';
import { InstructorTodayAttendancePanel } from '@/modules/instructor-portal/components/instructor-today-attendance-panel';
import { getInstructorDashboardOverview } from '@/modules/instructor-portal/queries/get-instructor-dashboard-overview';
import { getInstructorTodayAttendance } from '@/modules/instructor-portal/queries/get-instructor-today-attendance';

const NOW = new Date();

const HOUR_GREETING = (() => {
  const hour = NOW.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
})();

export default async function ProfessorDashboardPage() {
  const { instructor } = await requireInstructorContext();

  const [overview, todayAttendance] = await Promise.all([
    getInstructorDashboardOverview(instructor.id),
    getInstructorTodayAttendance(instructor.id),
  ]);

  const { stats } = overview;
  const firstName = instructor.fullName.split(' ')[0];

  const summaryCards = [
    {
      title: 'Turmas ativas',
      value: stats.classesCount,
      description: 'Turmas vinculadas a você.',
      iconKey: 'classes' as const,
      highlight: 'default' as const,
      action: 'link' as const,
      href: '/professor/turmas',
    },
    {
      title: 'Alunos',
      value: stats.studentsCount,
      description: 'Matriculados nas suas turmas.',
      iconKey: 'students' as const,
      highlight: 'default' as const,
      action: 'link' as const,
      href: '/professor/alunos',
    },
    {
      title: 'Aptos a graduar',
      value: stats.eligibleStudentsCount,
      description: 'Elegíveis para promoção.',
      iconKey: 'eligible' as const,
      highlight:
        stats.eligibleStudentsCount > 0
          ? ('success' as const)
          : ('default' as const),
      action: 'modal' as const,
      modal: 'eligible' as const,
    },
    {
      title: 'Inadimplentes',
      value: stats.delinquentStudentsCount,
      description: 'Presença bloqueada.',
      iconKey: 'delinquent' as const,
      highlight:
        stats.delinquentStudentsCount > 0
          ? ('warning' as const)
          : ('default' as const),
      action: 'modal' as const,
      modal: 'delinquent' as const,
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {HOUR_GREETING}, {firstName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
          Acompanhe suas aulas de hoje, marque presenças e acesse rapidamente
          suas turmas e alunos.
        </p>
      </section>

      <InstructorDashboardShell
        summaryCards={summaryCards}
        eligibleStudents={overview.eligibleStudents}
        delinquentStudents={overview.delinquentStudents}
      >
        <InstructorTodayAttendancePanel attendance={todayAttendance} />
      </InstructorDashboardShell>
    </div>
  );
}
