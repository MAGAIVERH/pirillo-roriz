import {
  computeDelta,
  formatBRL,
  formatNumber,
  formatPercent,
} from '../lib/analytics-helpers';
import type { ComparisonRow } from '../types/analytics';

export type ComparisonInputs = {
  activeStudents: { current: number; previous: number };
  mrrCents: { current: number; previous: number };
  newEnrollments: { current: number; previous: number };
  cancellations: { current: number; previous: number };
  delinquencyPercent: { current: number; previous: number };
  attendancePercent: { current: number; previous: number };
  funnelConversion: { current: number; goal: number };
  averageTicketCents: { current: number; previous: number };
};

export function buildComparisonTable(input: ComparisonInputs): ComparisonRow[] {
  return [
    {
      metric: 'Alunos ativos',
      previousLabel: formatNumber(input.activeStudents.previous),
      currentLabel: formatNumber(input.activeStudents.current),
      delta: computeDelta(
        input.activeStudents.current,
        input.activeStudents.previous,
      ),
    },
    {
      metric: 'MRR',
      previousLabel: formatBRL(input.mrrCents.previous),
      currentLabel: formatBRL(input.mrrCents.current),
      delta: computeDelta(input.mrrCents.current, input.mrrCents.previous),
    },
    {
      metric: 'Novas matrículas',
      previousLabel: formatNumber(input.newEnrollments.previous),
      currentLabel: formatNumber(input.newEnrollments.current),
      delta: computeDelta(
        input.newEnrollments.current,
        input.newEnrollments.previous,
      ),
    },
    {
      metric: 'Cancelamentos',
      previousLabel: formatNumber(input.cancellations.previous),
      currentLabel: formatNumber(input.cancellations.current),
      delta: computeDelta(
        input.cancellations.current,
        input.cancellations.previous,
        { inverse: true },
      ),
    },
    {
      metric: 'Inadimplência',
      previousLabel: formatPercent(input.delinquencyPercent.previous, 1),
      currentLabel: formatPercent(input.delinquencyPercent.current, 1),
      delta: computeDelta(
        input.delinquencyPercent.current,
        input.delinquencyPercent.previous,
        { inverse: true, pointsLabel: true },
      ),
    },
    {
      metric: 'Frequência média',
      previousLabel: formatPercent(input.attendancePercent.previous, 0),
      currentLabel: formatPercent(input.attendancePercent.current, 0),
      delta: computeDelta(
        input.attendancePercent.current,
        input.attendancePercent.previous,
        { pointsLabel: true },
      ),
    },
    {
      metric: 'Conversão do funil',
      previousLabel: `${input.funnelConversion.goal}% (meta)`,
      currentLabel: formatPercent(input.funnelConversion.current, 0),
      delta: computeDelta(
        input.funnelConversion.current,
        input.funnelConversion.goal,
        { pointsLabel: true },
      ),
    },
    {
      metric: 'Ticket médio',
      previousLabel: formatBRL(input.averageTicketCents.previous),
      currentLabel: formatBRL(input.averageTicketCents.current),
      delta: computeDelta(
        input.averageTicketCents.current,
        input.averageTicketCents.previous,
      ),
    },
  ];
}
