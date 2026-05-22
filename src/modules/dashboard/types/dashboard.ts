import type { LucideIcon } from 'lucide-react';

import type { StudentMissingRule } from '@/modules/students/queries/get-students-missing-graduation-rule';

export type DashboardStat = {
  id:
    | 'activeStudents'
    | 'activeClasses'
    | 'eligibleForPromotion'
    | 'pendingReservations'
    | 'mrr'
    | 'overdueInvoices';
  title: string;
  value: string;
  description: string;
  highlight?: 'success' | 'warning' | 'danger' | 'info' | 'default';
};

export type DashboardStatWithIcon = DashboardStat & {
  icon: LucideIcon;
};

export type DashboardEligibleStudent = {
  studentId: string;
  fullName: string;
  fromLabel: string;
  toLabel: string;
  attendances: number;
  projectedDate: string | null;
};

export type DashboardWarningPreview = {
  id: string;
  title: string;
  type: 'info' | 'aviso' | 'importante';
  publishedAt: string | null;
  expiresAt: string | null;
};

export type DashboardFinancePulse = {
  paidThisMonthLabel: string;
  pendingThisMonthLabel: string;
  overdueLabel: string;
  paidInvoices: number;
  overdueInvoices: number;
  upcomingInvoices: number;
};

export type DashboardOverview = {
  stats: DashboardStat[];
  eligibleStudents: DashboardEligibleStudent[];
  warnings: DashboardWarningPreview[];
  finance: DashboardFinancePulse;
  studentsMissingRule: StudentMissingRule[];
};
