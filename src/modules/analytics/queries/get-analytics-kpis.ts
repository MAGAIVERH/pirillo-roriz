import {
  computeDelta,
  formatBRL,
  formatNumber,
  formatPercent,
} from '../lib/analytics-helpers';
import type { AnalyticsKpi } from '../types/analytics';
import type { MonthlyMetrics } from './get-monthly-metrics';

type BuildKpisInput = {
  current: MonthlyMetrics;
  previous: MonthlyMetrics;
};

export function buildAnalyticsKpis({
  current,
  previous,
}: BuildKpisInput): AnalyticsKpi[] {
  return [
    {
      id: 'activeStudents',
      title: 'Alunos ativos',
      description: 'Matrículas com status ativo no fim do mês.',
      value: formatNumber(current.activeStudents),
      delta: computeDelta(current.activeStudents, previous.activeStudents),
    },
    {
      id: 'newEnrollments',
      title: 'Novas matrículas',
      description: 'Alunos com data de entrada dentro do período.',
      value: formatNumber(current.newEnrollments),
      delta: computeDelta(current.newEnrollments, previous.newEnrollments),
    },
    {
      id: 'cancellations',
      title: 'Cancelamentos',
      description: 'Mudanças para status cancelado ou inativo.',
      value: formatNumber(current.cancellations),
      delta: computeDelta(current.cancellations, previous.cancellations, {
        inverse: true,
      }),
    },
    {
      id: 'mrr',
      title: 'MRR',
      description: 'Receita recorrente paga no mês.',
      value: formatBRL(current.mrrCents),
      delta: computeDelta(current.mrrCents, previous.mrrCents),
    },
    {
      id: 'delinquency',
      title: 'Inadimplência',
      description: `${formatPercent(current.delinquencyPercent)} do previsto.`,
      value: formatBRL(current.delinquencyCents),
      delta: computeDelta(current.delinquencyCents, previous.delinquencyCents, {
        inverse: true,
      }),
    },
    {
      id: 'averageTicket',
      title: 'Ticket médio',
      description: 'Valor médio por fatura paga no mês.',
      value: formatBRL(current.averageTicketCents),
      delta: computeDelta(
        current.averageTicketCents,
        previous.averageTicketCents,
      ),
    },
  ];
}
