import { buildBenchmarkEntry } from '../lib/analytics-benchmarks';
import { formatPercent } from '../lib/analytics-helpers';
import type { BenchmarkEntry } from '../types/analytics';

type BuildBenchmarksInput = {
  churnPercent: number;
  trialConversionPercent: number;
  attendancePercent: number;
  delinquencyPercent: number;
};

export function buildBenchmarks(input: BuildBenchmarksInput): BenchmarkEntry[] {
  return [
    buildBenchmarkEntry('churn', input.churnPercent, (value) =>
      formatPercent(value, 1),
    ),
    buildBenchmarkEntry(
      'trialConversion',
      input.trialConversionPercent,
      (value) => formatPercent(value, 0),
    ),
    buildBenchmarkEntry('attendance', input.attendancePercent, (value) =>
      formatPercent(value, 0),
    ),
    buildBenchmarkEntry('delinquency', input.delinquencyPercent, (value) =>
      formatPercent(value, 1),
    ),
  ];
}
