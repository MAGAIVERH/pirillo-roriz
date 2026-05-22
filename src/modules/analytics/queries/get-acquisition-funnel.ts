import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import type { StudentStatus } from '@/generated/prisma/client';

import { safeDivision } from '../lib/analytics-helpers';
import type {
  AcquisitionFunnel,
  AcquisitionFunnelStep,
  AcquisitionSource,
  AnalyticsPeriod,
} from '../types/analytics';

function conversionPercent(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(safeDivision(current, previous) * 100);
}

export async function getAcquisitionFunnel(
  period: AnalyticsPeriod,
): Promise<AcquisitionFunnel> {
  const academy = await getOrCreateDefaultAcademy();

  const dateFilter = {
    gte: period.current.start,
    lte: period.current.end,
  };

  async function countStudentsReachingStatus(
    statuses: StudentStatus[],
  ): Promise<number> {
    const result = await db.studentStatusHistory.findMany({
      where: {
        student: { academyId: academy.id },
        toStatus: { in: statuses },
        changedAt: dateFilter,
      },
      distinct: ['studentId'],
      select: { studentId: true },
    });
    return result.length;
  }

  const [leads, trialScheduled, trialAttended, enrolled, leadSources] =
    await Promise.all([
      countStudentsReachingStatus(['LEAD']),
      countStudentsReachingStatus(['TRIAL', 'ACTIVE']),
      db.student.count({
        where: {
          academyId: academy.id,
          status: { in: ['TRIAL', 'ACTIVE'] },
          attendances: {
            some: {
              status: 'PRESENT',
              createdAt: dateFilter,
            },
          },
        },
      }),
      countStudentsReachingStatus(['ACTIVE']),
      db.student.groupBy({
        by: ['leadSourceId'],
        where: {
          academyId: academy.id,
          createdAt: dateFilter,
        },
        _count: { _all: true },
      }),
    ]);

  const sourceIds = leadSources
    .map((entry) => entry.leadSourceId)
    .filter((id): id is string => Boolean(id));

  const leadSourceRecords = sourceIds.length
    ? await db.leadSource.findMany({
        where: { id: { in: sourceIds } },
        select: { id: true, name: true },
      })
    : [];

  const nameById = new Map(leadSourceRecords.map((item) => [item.id, item.name]));

  const sources: AcquisitionSource[] = leadSources
    .map((entry) => ({
      name: entry.leadSourceId
        ? (nameById.get(entry.leadSourceId) ?? 'Outras origens')
        : 'Sem origem definida',
      count: entry._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  const steps: AcquisitionFunnelStep[] = [
    {
      id: 'leads',
      label: 'Leads recebidos',
      count: leads,
      conversionPercent: null,
    },
    {
      id: 'trialScheduled',
      label: 'Agendaram trial',
      count: trialScheduled,
      conversionPercent: conversionPercent(trialScheduled, leads),
    },
    {
      id: 'trialAttended',
      label: 'Fizeram trial',
      count: trialAttended,
      conversionPercent: conversionPercent(trialAttended, trialScheduled),
    },
    {
      id: 'enrolled',
      label: 'Matricularam',
      count: enrolled,
      conversionPercent: conversionPercent(enrolled, trialAttended),
    },
  ];

  return {
    steps,
    finalConversionPercent: Math.round(safeDivision(enrolled, leads) * 100),
    goalConversionPercent: 60,
    sources,
  };
}
