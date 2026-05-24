import {
  CalendarDays,
  GraduationCap,
  TriangleAlert,
  Users,
} from 'lucide-react';

import { requireInstructorContext } from '@/lib/session-context';
import { InstructorAttentionList } from '@/modules/instructor-portal/components/instructor-attention-list';
import { InstructorSummaryCard } from '@/modules/instructor-portal/components/instructor-summary-card';
import { InstructorTodayClasses } from '@/modules/instructor-portal/components/instructor-today-classes';
import { getInstructorDashboardOverview } from '@/modules/instructor-portal/queries/get-instructor-dashboard-overview';

const NOW = new Date();

const HOUR_GREETING = (() => {
  const hour = NOW.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
})();

export default async function ProfessorDashboardPage() {
  const { instructor } = await requireInstructorContext();
  const overview = await getInstructorDashboardOverview(instructor.id);
  const { stats } = overview;

  const firstName = instructor.fullName.split(' ')[0];

  const summaryCards = [
    {
      title: 'Turmas ativas',
      value: stats.classesCount,
      description: 'Turmas vinculadas a você.',
      icon: CalendarDays,
      href: '/professor/turmas',
      highlight: 'default' as const,
    },
    {
      title: 'Alunos',
      value: stats.studentsCount,
      description: 'Matriculados nas suas turmas.',
      icon: Users,
      href: '/professor/alunos',
      highlight: 'default' as const,
    },
    {
      title: 'Aptos a graduar',
      value: stats.eligibleStudentsCount,
      description: 'Elegíveis para promoção.',
      icon: GraduationCap,
      href: '/professor/alunos?filtro=aptos',
      highlight:
        stats.eligibleStudentsCount > 0
          ? ('success' as const)
          : ('default' as const),
    },
    {
      title: 'Inadimplentes',
      value: stats.delinquentStudentsCount,
      description: 'Presença bloqueada.',
      icon: TriangleAlert,
      href: '/professor/alunos?filtro=inadimplentes',
      highlight:
        stats.delinquentStudentsCount > 0
          ? ('warning' as const)
          : ('default' as const),
    },
  ];

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {HOUR_GREETING}, {firstName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
          Acompanhe suas aulas de hoje, alunos que precisam de atenção e lance
          presenças nas turmas.
        </p>
      </section>

      <section className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <InstructorSummaryCard key={card.title} {...card} />
        ))}
      </section>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <InstructorTodayClasses classes={overview.todayClasses} />
        <InstructorAttentionList
          students={overview.attentionStudents}
          eligibleCount={stats.eligibleStudentsCount}
          delinquentCount={stats.delinquentStudentsCount}
        />
      </div>
    </div>
  );
}
