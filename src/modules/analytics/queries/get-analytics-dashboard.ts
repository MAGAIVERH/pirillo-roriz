import { getOrCreateDefaultAcademy } from '@/lib/academy';

import { safeDivision } from '../lib/analytics-helpers';
import type {
  AnalyticsDashboardData,
  AnalyticsPeriod,
} from '../types/analytics';

import { getAcquisitionFunnel } from './get-acquisition-funnel';
import { getAnalyticsAlerts } from './get-analytics-alerts';
import { buildAnalyticsKpis } from './get-analytics-kpis';
import { getBeltsDistribution } from './get-belts-distribution';
import { buildBenchmarks } from './get-benchmarks';
import { buildComparisonTable } from './get-comparison-table';
import { getEnrollmentsEvolution } from './get-enrollments-evolution';
import { getInstructorsPerformance } from './get-instructors-performance';
import { getMonthlyMetrics } from './get-monthly-metrics';
import { getMrrEvolution } from './get-mrr-evolution';
import { getPresenceData } from './get-presence-data';

export async function getAnalyticsDashboard(
  period: AnalyticsPeriod,
): Promise<AnalyticsDashboardData> {
  const academy = await getOrCreateDefaultAcademy();

  const [
    currentMetrics,
    previousMetrics,
    alerts,
    mrrEvolution,
    enrollmentsEvolution,
    presence,
    funnel,
    belts,
    instructors,
  ] = await Promise.all([
    getMonthlyMetrics(academy.id, period.current),
    getMonthlyMetrics(academy.id, period.previous),
    getAnalyticsAlerts(),
    getMrrEvolution(period),
    getEnrollmentsEvolution(period),
    getPresenceData(period),
    getAcquisitionFunnel(period),
    getBeltsDistribution(),
    getInstructorsPerformance(period),
  ]);

  const kpis = buildAnalyticsKpis({
    current: currentMetrics,
    previous: previousMetrics,
  });

  const comparison = buildComparisonTable({
    activeStudents: {
      current: currentMetrics.activeStudents,
      previous: previousMetrics.activeStudents,
    },
    mrrCents: {
      current: currentMetrics.mrrCents,
      previous: previousMetrics.mrrCents,
    },
    newEnrollments: {
      current: currentMetrics.newEnrollments,
      previous: previousMetrics.newEnrollments,
    },
    cancellations: {
      current: currentMetrics.cancellations,
      previous: previousMetrics.cancellations,
    },
    delinquencyPercent: {
      current: currentMetrics.delinquencyPercent,
      previous: previousMetrics.delinquencyPercent,
    },
    attendancePercent: {
      current: currentMetrics.attendancePercent,
      previous: previousMetrics.attendancePercent,
    },
    funnelConversion: {
      current: funnel.finalConversionPercent,
      goal: funnel.goalConversionPercent,
    },
    averageTicketCents: {
      current: currentMetrics.averageTicketCents,
      previous: previousMetrics.averageTicketCents,
    },
  });

  const churnPercent =
    safeDivision(
      currentMetrics.cancellations,
      currentMetrics.activeStudentsAtStart,
    ) * 100;

  const benchmarks = buildBenchmarks({
    churnPercent,
    trialConversionPercent: funnel.finalConversionPercent,
    attendancePercent: currentMetrics.attendancePercent,
    delinquencyPercent: currentMetrics.delinquencyPercent,
  });

  return {
    period,
    kpis,
    alerts,
    mrrEvolution,
    enrollmentsEvolution,
    presence,
    funnel,
    belts,
    instructors,
    comparison,
    benchmarks,
  };
}
