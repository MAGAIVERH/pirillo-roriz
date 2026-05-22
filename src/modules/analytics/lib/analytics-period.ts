import type {
  AnalyticsPeriod,
  AnalyticsPeriodBounds,
} from '../types/analytics';

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;

const SHORT_MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const;

function buildBounds(year: number, monthZeroBased: number): AnalyticsPeriodBounds {
  const start = new Date(year, monthZeroBased, 1, 0, 0, 0, 0);
  const end = new Date(year, monthZeroBased + 1, 0, 23, 59, 59, 999);

  return {
    year,
    month: monthZeroBased + 1,
    label: `${MONTH_LABELS[monthZeroBased]} ${year}`,
    start,
    end,
  };
}

export function resolveAnalyticsPeriod(
  rawYear?: string,
  rawMonth?: string,
): AnalyticsPeriod {
  const now = new Date();

  const yearValue = rawYear ? Number.parseInt(rawYear, 10) : now.getFullYear();
  const monthValue = rawMonth
    ? Number.parseInt(rawMonth, 10) - 1
    : now.getMonth();

  const safeYear =
    Number.isInteger(yearValue) && yearValue >= 2020 && yearValue <= 2100
      ? yearValue
      : now.getFullYear();

  const safeMonth =
    Number.isInteger(monthValue) && monthValue >= 0 && monthValue <= 11
      ? monthValue
      : now.getMonth();

  const current = buildBounds(safeYear, safeMonth);

  const previousMonthZeroBased = safeMonth === 0 ? 11 : safeMonth - 1;
  const previousYear = safeMonth === 0 ? safeYear - 1 : safeYear;
  const previous = buildBounds(previousYear, previousMonthZeroBased);

  return { current, previous };
}

export function getLastNMonthsBounds(
  reference: AnalyticsPeriodBounds,
  count: number,
): AnalyticsPeriodBounds[] {
  const list: AnalyticsPeriodBounds[] = [];

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(reference.year, reference.month - 1 - i, 1);
    list.push(buildBounds(date.getFullYear(), date.getMonth()));
  }

  return list;
}

export function monthShortLabel(monthOneBased: number): string {
  const index = monthOneBased - 1;
  if (index < 0 || index > 11) return '';
  return SHORT_MONTH_LABELS[index];
}

export function monthKey(year: number, monthOneBased: number): string {
  return `${year}-${String(monthOneBased).padStart(2, '0')}`;
}
