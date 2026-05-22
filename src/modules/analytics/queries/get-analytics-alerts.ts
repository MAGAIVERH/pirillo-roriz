import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import type { AnalyticsAlert } from '../types/analytics';

const CHURN_RISK_DAYS = 21;
const UPCOMING_DUE_DAYS = 3;

function diffInDays(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getAnalyticsAlerts(): Promise<AnalyticsAlert[]> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();

  const churnThreshold = new Date(now);
  churnThreshold.setDate(churnThreshold.getDate() - CHURN_RISK_DAYS);

  const upcomingThreshold = new Date(now);
  upcomingThreshold.setDate(upcomingThreshold.getDate() + UPCOMING_DUE_DAYS);

  const [activeStudents, upcomingInvoices, eligibleForPromotion] =
    await Promise.all([
      db.student.findMany({
        where: {
          academyId: academy.id,
          status: 'ACTIVE',
        },
        select: {
          id: true,
          attendances: {
            where: { status: 'PRESENT' },
            orderBy: {
              classSession: { startsAt: 'desc' },
            },
            take: 1,
            select: {
              classSession: { select: { startsAt: true } },
            },
          },
        },
      }),
      db.invoice.count({
        where: {
          academyId: academy.id,
          status: 'PENDING',
          dueDate: { gte: now, lte: upcomingThreshold },
        },
      }),
      db.studentProgress.count({
        where: {
          academyId: academy.id,
          status: 'ELIGIBLE',
          student: { status: 'ACTIVE' },
        },
      }),
    ]);

  const studentsAtRisk = activeStudents.filter((student) => {
    const lastAttendance = student.attendances[0]?.classSession.startsAt;
    if (!lastAttendance) return true;
    return diffInDays(lastAttendance, now) >= CHURN_RISK_DAYS;
  }).length;

  const alerts: AnalyticsAlert[] = [];

  if (studentsAtRisk > 0) {
    alerts.push({
      id: 'churn-risk',
      tone: 'critical',
      message: `${studentsAtRisk} alunos sem presença há ${CHURN_RISK_DAYS}+ dias`,
      hint: 'Risco de cancelamento — acione retenção.',
    });
  }

  if (upcomingInvoices > 0) {
    alerts.push({
      id: 'upcoming-invoices',
      tone: 'warning',
      message: `${upcomingInvoices} mensalidades vencem em ${UPCOMING_DUE_DAYS} dias`,
      hint: 'Acionar cobrança preventiva.',
    });
  }

  if (eligibleForPromotion > 0) {
    alerts.push({
      id: 'promotion-eligible',
      tone: 'opportunity',
      message: `${eligibleForPromotion} alunos elegíveis para graduação`,
      hint: 'Aprove a promoção em cada aluno ou planeje cerimônia.',
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: 'all-clear',
      tone: 'info',
      message: 'Nenhum alerta crítico no momento',
      hint: 'Operação rodando dentro do esperado.',
    });
  }

  return alerts;
}
