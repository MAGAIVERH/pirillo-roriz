import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { typeToWarningType } from '@/modules/warnings/lib/warning-mappers';
import { getEligibleStudents } from '@/modules/students/queries/get-eligible-students';
import {
  getStudentsMissingGraduationRule,
  type StudentMissingRule,
} from '@/modules/students/queries/get-students-missing-graduation-rule';
import { runStudentDelinquencySync } from '@/modules/students/lib/sync-student-delinquency-core';

import {
  formatBRL,
  formatBeltLabel,
  formatNumber,
} from '../lib/dashboard-formatters';
import type {
  DashboardEligibleStudent,
  DashboardFinancePulse,
  DashboardOverview,
  DashboardStat,
  DashboardWarningPreview,
} from '../types/dashboard';

const UPCOMING_DAYS = 7;

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const academy = await getOrCreateDefaultAcademy();
  // Garante que faturas vencidas viram OVERDUE e que o status do aluno
  // reflete a inadimplência antes de calcular qualquer métrica.
  await runStudentDelinquencySync();
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  const upcomingThreshold = new Date(now);
  upcomingThreshold.setDate(upcomingThreshold.getDate() + UPCOMING_DAYS);

  const [
    activeStudents,
    activeClasses,
    eligibleCount,
    pendingReservations,
    paidInvoices,
    pendingInvoices,
    overdueInvoices,
    upcomingInvoices,
    eligibleStudents,
    warnings,
    studentsMissingRule,
  ] = await Promise.all([
    db.student.count({
      where: { academyId: academy.id, status: 'ACTIVE' },
    }),
    db.class.count({
      where: { academyId: academy.id, active: true },
    }),
    db.studentProgress.count({
      where: {
        academyId: academy.id,
        status: 'ELIGIBLE',
        student: { status: 'ACTIVE' },
      },
    }),
    db.order.count({
      where: { academyId: academy.id, status: 'PENDING' },
    }),
    db.invoice.findMany({
      where: {
        academyId: academy.id,
        status: 'PAID',
        paidAt: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { amountInCents: true, discountInCents: true },
    }),
    db.invoice.findMany({
      where: {
        academyId: academy.id,
        status: 'PENDING',
        dueDate: { gte: startOfMonth, lte: endOfMonth },
      },
      select: { amountInCents: true, discountInCents: true },
    }),
    db.invoice.findMany({
      where: {
        academyId: academy.id,
        status: 'OVERDUE',
        dueDate: { lte: now },
      },
      select: { amountInCents: true, discountInCents: true },
    }),
    db.invoice.count({
      where: {
        academyId: academy.id,
        status: 'PENDING',
        dueDate: { gte: now, lte: upcomingThreshold },
      },
    }),
    getEligibleStudents(),
    db.announcement.findMany({
      where: {
        academyId: academy.id,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
      select: {
        id: true,
        title: true,
        type: true,
        publishedAt: true,
        expiresAt: true,
      },
    }),
    getStudentsMissingGraduationRule(),
  ]);

  const mrrCents = paidInvoices.reduce(
    (acc, invoice) => acc + invoice.amountInCents - invoice.discountInCents,
    0,
  );

  const pendingCents = pendingInvoices.reduce(
    (acc, invoice) => acc + invoice.amountInCents - invoice.discountInCents,
    0,
  );

  const overdueCents = overdueInvoices.reduce(
    (acc, invoice) => acc + invoice.amountInCents - invoice.discountInCents,
    0,
  );

  const stats: DashboardStat[] = [
    {
      id: 'activeStudents',
      title: 'Alunos ativos',
      value: formatNumber(activeStudents),
      description: 'Total de matrículas ativas no momento.',
    },
    {
      id: 'activeClasses',
      title: 'Turmas ativas',
      value: formatNumber(activeClasses),
      description: 'Turmas atualmente recebendo alunos.',
    },
    {
      id: 'eligibleForPromotion',
      title: 'Aptos a graduar',
      value: formatNumber(eligibleCount),
      description: 'Alunos que atingiram a regra de graduação.',
      highlight: eligibleCount > 0 ? 'success' : 'default',
    },
    {
      id: 'mrr',
      title: 'Receita do mês',
      value: formatBRL(mrrCents),
      description: 'Faturas pagas desde o início do mês.',
      highlight: 'info',
    },
    {
      id: 'overdueInvoices',
      title: 'Inadimplência',
      value: formatBRL(overdueCents),
      description: `${overdueInvoices.length} fatura(s) em atraso.`,
      highlight: overdueCents > 0 ? 'danger' : 'default',
    },
    {
      id: 'pendingReservations',
      title: 'Reservas da loja',
      value: formatNumber(pendingReservations),
      description: 'Pedidos aguardando retirada.',
      highlight: pendingReservations > 0 ? 'warning' : 'default',
    },
  ];

  const eligibleStudentsPreview: DashboardEligibleStudent[] = eligibleStudents
    .slice(0, 5)
    .map((student) => ({
      studentId: student.studentId,
      fullName: student.fullName,
      fromLabel: formatBeltLabel(
        student.currentBeltName,
        student.currentDegreeNumber,
      ),
      toLabel: formatBeltLabel(
        student.nextBeltName,
        student.nextDegreeNumber,
      ),
      attendances: student.attendancesSincePromotion,
      projectedDate: student.projectedEligibilityDate,
    }));

  const warningsPreview: DashboardWarningPreview[] = warnings.map((warning) => ({
    id: warning.id,
    title: warning.title,
    type: typeToWarningType(warning.type),
    publishedAt: warning.publishedAt
      ? warning.publishedAt.toLocaleDateString('pt-BR')
      : null,
    expiresAt: warning.expiresAt
      ? warning.expiresAt.toLocaleDateString('pt-BR')
      : null,
  }));

  const finance: DashboardFinancePulse = {
    paidThisMonthLabel: formatBRL(mrrCents),
    pendingThisMonthLabel: formatBRL(pendingCents),
    overdueLabel: formatBRL(overdueCents),
    paidInvoices: paidInvoices.length,
    overdueInvoices: overdueInvoices.length,
    upcomingInvoices,
  };

  return {
    stats,
    eligibleStudents: eligibleStudentsPreview,
    warnings: warningsPreview,
    finance,
    studentsMissingRule,
  };
}
