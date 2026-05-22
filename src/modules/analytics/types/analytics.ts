export type AnalyticsPeriodBounds = {
  year: number;
  month: number;
  label: string;
  start: Date;
  end: Date;
};

export type AnalyticsPeriod = {
  current: AnalyticsPeriodBounds;
  previous: AnalyticsPeriodBounds;
};

export type DeltaTone = 'positive' | 'negative' | 'neutral';

export type Delta = {
  rawDiff: number;
  percent: number;
  tone: DeltaTone;
  label: string;
};

export type AnalyticsKpi = {
  id:
    | 'activeStudents'
    | 'newEnrollments'
    | 'cancellations'
    | 'mrr'
    | 'delinquency'
    | 'averageTicket';
  title: string;
  description: string;
  value: string;
  delta: Delta;
};

export type AnalyticsAlertTone =
  | 'critical'
  | 'warning'
  | 'opportunity'
  | 'info';

export type AnalyticsAlert = {
  id: string;
  tone: AnalyticsAlertTone;
  message: string;
  hint?: string;
};

export type MrrPoint = {
  monthKey: string;
  label: string;
  valueCents: number;
};

export type EnrollmentsPoint = {
  monthKey: string;
  label: string;
  entries: number;
  exits: number;
  net: number;
};

export type PresenceHeatmapCell = {
  weekDay: number;
  hour: number;
  checkIns: number;
};

export type PresenceData = {
  heatmap: PresenceHeatmapCell[];
  attendanceRate: number;
  studentsBelowHalfRate: number;
  topClass: { name: string; schedule: string | null } | null;
};

export type AcquisitionFunnelStep = {
  id: 'leads' | 'trialScheduled' | 'trialAttended' | 'enrolled';
  label: string;
  count: number;
  conversionPercent: number | null;
};

export type AcquisitionSource = {
  name: string;
  count: number;
};

export type AcquisitionFunnel = {
  steps: AcquisitionFunnelStep[];
  finalConversionPercent: number;
  goalConversionPercent: number;
  sources: AcquisitionSource[];
};

export type BeltDistributionEntry = {
  beltId: string;
  beltName: string;
  beltColor: string;
  sortOrder: number;
  students: number;
  eligibleForPromotion: number;
};

export type InstructorPerformance = {
  id: string;
  fullName: string;
  beltLabel: string;
  studentsCount: number;
  monthlyClasses: number;
  attendanceRate: number;
  retentionRate: number;
};

export type ComparisonRow = {
  metric: string;
  previousLabel: string;
  currentLabel: string;
  delta: Delta;
};

export type BenchmarkStatus = 'healthy' | 'warning' | 'risk';

export type BenchmarkEntry = {
  metric: string;
  reference: string;
  currentLabel: string;
  status: BenchmarkStatus;
  note: string;
};

export type AnalyticsDashboardData = {
  period: AnalyticsPeriod;
  kpis: AnalyticsKpi[];
  alerts: AnalyticsAlert[];
  mrrEvolution: MrrPoint[];
  enrollmentsEvolution: EnrollmentsPoint[];
  presence: PresenceData;
  funnel: AcquisitionFunnel;
  belts: BeltDistributionEntry[];
  instructors: InstructorPerformance[];
  comparison: ComparisonRow[];
  benchmarks: BenchmarkEntry[];
};
