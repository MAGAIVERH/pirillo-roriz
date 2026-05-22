import type { BenchmarkEntry, BenchmarkStatus } from '../types/analytics';

/**
 * Padrões de redes top de jiu-jitsu (Gracie Barra, Alliance, Checkmat)
 * usados como referência para o dono da unidade.
 */
type BenchmarkSpec = {
  metric: string;
  reference: string;
  /** Resolve o status com base no valor atual da unidade. */
  evaluate: (value: number) => BenchmarkStatus;
  /** Texto curto explicando a leitura. */
  note: (status: BenchmarkStatus) => string;
};

export const BENCHMARK_SPECS: Record<
  'churn' | 'trialConversion' | 'attendance' | 'delinquency',
  BenchmarkSpec
> = {
  churn: {
    metric: 'Churn mensal',
    reference: '< 5%',
    evaluate: (value) =>
      value < 5 ? 'healthy' : value < 8 ? 'warning' : 'risk',
    note: (status) =>
      status === 'healthy'
        ? 'Retenção saudável.'
        : status === 'warning'
          ? 'Acompanhe os motivos de saída.'
          : 'Alta evasão — investigue causas.',
  },
  trialConversion: {
    metric: 'Conversão de trial',
    reference: '60–70%',
    evaluate: (value) =>
      value >= 60 ? 'healthy' : value >= 45 ? 'warning' : 'risk',
    note: (status) =>
      status === 'healthy'
        ? 'Funil de aquisição forte.'
        : status === 'warning'
          ? 'Reforce follow-up pós-trial.'
          : 'Funil exige atenção urgente.',
  },
  attendance: {
    metric: 'Frequência média',
    reference: '> 70%',
    evaluate: (value) =>
      value > 70 ? 'healthy' : value >= 55 ? 'warning' : 'risk',
    note: (status) =>
      status === 'healthy'
        ? 'Engajamento alto.'
        : status === 'warning'
          ? 'Estimule presença e reativação.'
          : 'Frequência baixa — risco de churn.',
  },
  delinquency: {
    metric: 'Inadimplência',
    reference: '< 8%',
    evaluate: (value) =>
      value < 5 ? 'healthy' : value < 8 ? 'warning' : 'risk',
    note: (status) =>
      status === 'healthy'
        ? 'Carteira limpa.'
        : status === 'warning'
          ? 'Acione cobrança preventiva.'
          : 'Inadimplência alta — revise cobrança.',
  },
};

export function buildBenchmarkEntry(
  key: keyof typeof BENCHMARK_SPECS,
  value: number,
  formatValue: (value: number) => string,
): BenchmarkEntry {
  const spec = BENCHMARK_SPECS[key];
  const status = spec.evaluate(value);

  return {
    metric: spec.metric,
    reference: spec.reference,
    currentLabel: formatValue(value),
    status,
    note: spec.note(status),
  };
}
