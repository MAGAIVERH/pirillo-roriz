import { db } from '@/lib/db';

import { safeDivision } from '../lib/analytics-helpers';
import type { AnalyticsPeriodBounds } from '../types/analytics';

export type MonthlyMetrics = {
  activeStudents: number;
  activeStudentsAtStart: number;
  newEnrollments: number;
  cancellations: number;
  mrrCents: number;
  expectedRevenueCents: number;
  delinquencyCents: number;
  delinquencyPercent: number;
  averageTicketCents: number;
  attendancePercent: number;
};

export async function getMonthlyMetrics(
  academyId: string,
  bounds: AnalyticsPeriodBounds,
): Promise<MonthlyMetrics> {
  const [
    activeStudents,
    activeStudentsAtStart,
    newEnrollments,
    cancellations,
    paidInvoices,
    monthInvoices,
    overdueInvoices,
    checkIns,
  ] = await Promise.all([
    db.student.count({
      where: {
        academyId,
        status: 'ACTIVE',
        joinDate: { lte: bounds.end },
        OR: [{ exitDate: null }, { exitDate: { gt: bounds.end } }],
      },
    }),
    db.student.count({
      where: {
        academyId,
        joinDate: { lte: bounds.start },
        OR: [{ exitDate: null }, { exitDate: { gt: bounds.start } }],
      },
    }),
    db.student.count({
      where: {
        academyId,
        joinDate: { gte: bounds.start, lte: bounds.end },
      },
    }),
    db.studentStatusHistory.count({
      where: {
        student: { academyId },
        toStatus: { in: ['CANCELED', 'INACTIVE'] },
        changedAt: { gte: bounds.start, lte: bounds.end },
      },
    }),
    db.invoice.findMany({
      where: {
        academyId,
        status: 'PAID',
        paidAt: { gte: bounds.start, lte: bounds.end },
      },
      select: { amountInCents: true, discountInCents: true },
    }),
    db.invoice.findMany({
      where: {
        academyId,
        status: { notIn: ['CANCELED', 'REFUNDED'] },
        dueDate: { gte: bounds.start, lte: bounds.end },
      },
      select: { amountInCents: true, discountInCents: true },
    }),
    db.invoice.findMany({
      where: {
        academyId,
        status: 'OVERDUE',
        dueDate: { lte: bounds.end },
      },
      select: { amountInCents: true, discountInCents: true },
    }),
    db.checkInLog.count({
      where: {
        academyId,
        status: 'SUCCESS',
        checkedInAt: { gte: bounds.start, lte: bounds.end },
      },
    }),
  ]);

  const mrrCents = paidInvoices.reduce(
    (acc, invoice) => acc + invoice.amountInCents - invoice.discountInCents,
    0,
  );

  const expectedRevenueCents = monthInvoices.reduce(
    (acc, invoice) => acc + invoice.amountInCents - invoice.discountInCents,
    0,
  );

  const delinquencyCents = overdueInvoices.reduce(
    (acc, invoice) => acc + invoice.amountInCents - invoice.discountInCents,
    0,
  );

  const delinquencyPercent =
    safeDivision(delinquencyCents, expectedRevenueCents) * 100;

  const averageTicketCents = paidInvoices.length
    ? Math.round(mrrCents / paidInvoices.length)
    : 0;

  const expectedCheckIns = activeStudents * 12;
  const attendancePercent = Math.min(
    safeDivision(checkIns, expectedCheckIns) * 100,
    100,
  );

  return {
    activeStudents,
    activeStudentsAtStart,
    newEnrollments,
    cancellations,
    mrrCents,
    expectedRevenueCents,
    delinquencyCents,
    delinquencyPercent,
    averageTicketCents,
    attendancePercent,
  };
}
