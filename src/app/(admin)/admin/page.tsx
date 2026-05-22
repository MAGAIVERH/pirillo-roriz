import { DashboardEligibleStudentsCard } from '@/modules/dashboard/components/dashboard-eligible-students-card';
import { DashboardFinancePulseCard } from '@/modules/dashboard/components/dashboard-finance-pulse';
import { DashboardMissingRulesCard } from '@/modules/dashboard/components/dashboard-missing-rules-card';
import { DashboardQuickActions } from '@/modules/dashboard/components/dashboard-quick-actions';
import { DashboardStatsGrid } from '@/modules/dashboard/components/dashboard-stats-grid';
import { DashboardWarningsCard } from '@/modules/dashboard/components/dashboard-warnings-card';
import { RecalculateProgressButton } from '@/modules/dashboard/components/recalculate-progress-button';
import { getDashboardOverview } from '@/modules/dashboard/queries/get-dashboard-overview';

const NOW = new Date();

const HOUR_GREETING = (() => {
  const hour = NOW.getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
})();

export default async function AdminPage() {
  const dashboard = await getDashboardOverview();

  const eligibleStat = dashboard.stats.find(
    (stat) => stat.id === 'eligibleForPromotion',
  );
  const eligibleCount = eligibleStat ? Number(eligibleStat.value.replace(/\D/g, '')) : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
              Pirillo Roriz · Painel
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {HOUR_GREETING}, Mestre
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-zinc-400">
              Visão consolidada da unidade: matrículas ativas, receita do mês,
              alunos aptos a graduar e operação da loja em um só lugar.
            </p>
          </div>

          <RecalculateProgressButton />
        </div>
      </section>

      <DashboardStatsGrid stats={dashboard.stats} />

      <DashboardMissingRulesCard students={dashboard.studentsMissingRule} />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <DashboardEligibleStudentsCard
          students={dashboard.eligibleStudents}
          totalCount={eligibleCount}
        />
        <DashboardQuickActions />
      </div>

      <DashboardFinancePulseCard finance={dashboard.finance} />

      <DashboardWarningsCard warnings={dashboard.warnings} />
    </div>
  );
}
