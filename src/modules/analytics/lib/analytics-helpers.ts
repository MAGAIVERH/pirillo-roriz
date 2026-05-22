import type { Delta, DeltaTone } from '../types/analytics';

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${value.toFixed(fractionDigits)}%`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

type ComputeDeltaOptions = {
  /** Quando true, queda é boa (cancelamentos, inadimplência). */
  inverse?: boolean;
  /** Diferença bruta em pontos percentuais ao invés de %. */
  pointsLabel?: boolean;
  fractionDigits?: number;
};

export function computeDelta(
  current: number,
  previous: number,
  options: ComputeDeltaOptions = {},
): Delta {
  const { inverse = false, pointsLabel = false, fractionDigits = 1 } = options;
  const rawDiff = current - previous;

  let percent = 0;
  if (previous === 0) {
    percent = current === 0 ? 0 : 100;
  } else {
    percent = (rawDiff / previous) * 100;
  }

  let tone: DeltaTone = 'neutral';
  if (rawDiff > 0) tone = inverse ? 'negative' : 'positive';
  if (rawDiff < 0) tone = inverse ? 'positive' : 'negative';

  const sign = rawDiff > 0 ? '+' : rawDiff < 0 ? '' : '±';
  const label = pointsLabel
    ? `${sign}${rawDiff.toFixed(fractionDigits)}pp`
    : `${sign}${percent.toFixed(fractionDigits)}%`;

  return { rawDiff, percent, tone, label };
}

export function safeDivision(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}
