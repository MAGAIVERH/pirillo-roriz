import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { computeWarningStatus } from '../lib/warning-mappers';
import type { WarningsOverviewStats } from '../types/warnings';

export async function getWarningsOverviewStats(): Promise<WarningsOverviewStats> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();

  const rows = await db.announcement.findMany({
    where: {
      academyId: academy.id,
      visibilityScope: { in: ['ALL', 'STUDENTS', 'INSTRUCTORS'] },
    },
    select: {
      publishedAt: true,
      expiresAt: true,
    },
  });

  let active = 0;
  let drafts = 0;
  let expired = 0;

  for (const row of rows) {
    const status = computeWarningStatus(row.publishedAt, row.expiresAt, now);

    if (status === 'ativo' || status === 'agendado') {
      active += 1;
    } else if (status === 'rascunho') {
      drafts += 1;
    } else if (status === 'expirado') {
      expired += 1;
    }
  }

  return {
    total: rows.length,
    active,
    drafts,
    expired,
  };
}
