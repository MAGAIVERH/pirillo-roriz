import {
  CreditCard,
  Receipt,
  TrendingDown,
  UserCheck,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';

import { AcquisitionFunnelView } from '@/modules/analytics/components/acquisition-funnel';
import { AnalyticsAlertsBar } from '@/modules/analytics/components/analytics-alerts-bar';
import { AnalyticsPeriodPicker } from '@/modules/analytics/components/analytics-period-picker';
import { BeltsPyramid } from '@/modules/analytics/components/belts-pyramid';
import { BenchmarkCards } from '@/modules/analytics/components/benchmark-cards';
import { ComparisonTable } from '@/modules/analytics/components/comparison-table';
import { EnrollmentsChart } from '@/modules/analytics/components/enrollments-chart';
import { InstructorsTable } from '@/modules/analytics/components/instructors-table';
import { KpiCard } from '@/modules/analytics/components/kpi-card';
import { MrrChart } from '@/modules/analytics/components/mrr-chart';
import { PresenceHeatmap } from '@/modules/analytics/components/presence-heatmap';
import { resolveAnalyticsPeriod } from '@/modules/analytics/lib/analytics-period';
import { getAnalyticsDashboard } from '@/modules/analytics/queries/get-analytics-dashboard';
import type { AnalyticsKpi } from '@/modules/analytics/types/analytics';

type AnalyticsPageProps = {
  searchParams: Promise<{
    ano?: string;
    mes?: string;
  }>;
};

const KPI_ICONS: Record<AnalyticsKpi['id'], LucideIcon> = {
  activeStudents: UserCheck,
  newEnrollments: UserPlus,
  cancellations: UserMinus,
  mrr: CreditCard,
  delinquency: TrendingDown,
  averageTicket: Receipt,
};

export default async function AdminAnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const { ano, mes } = await searchParams;
  const period = resolveAnalyticsPeriod(ano, mes);

  const dashboard = await getAnalyticsDashboard(period);

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
              Módulo
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Analytics e inteligência
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-zinc-400">
              Visão estratégica da unidade — comparativo mês a mês de retenção,
              receita, presença e oportunidades de graduação, com benchmarks de
              redes top do jiu-jitsu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs uppercase tracking-wide text-zinc-400">
              Período
            </span>
            <AnalyticsPeriodPicker
              currentLabel={period.current.label}
              currentYear={period.current.year}
              currentMonth={period.current.month}
            />
            <span className="hidden rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs text-zinc-400 md:inline">
              vs {period.previous.label}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboard.kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} icon={KPI_ICONS[kpi.id]} />
        ))}
      </section>

      <AnalyticsAlertsBar alerts={dashboard.alerts} />

      <section className="grid gap-6 xl:grid-cols-2">
        <MrrChart data={dashboard.mrrEvolution} />
        <EnrollmentsChart data={dashboard.enrollmentsEvolution} />
      </section>

      <PresenceHeatmap presence={dashboard.presence} />

      <AcquisitionFunnelView funnel={dashboard.funnel} />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <BeltsPyramid belts={dashboard.belts} />
        <InstructorsTable instructors={dashboard.instructors} />
      </section>

      <ComparisonTable
        rows={dashboard.comparison}
        previousLabel={period.previous.label}
        currentLabel={period.current.label}
      />

      <BenchmarkCards benchmarks={dashboard.benchmarks} />
    </div>
  );
}
