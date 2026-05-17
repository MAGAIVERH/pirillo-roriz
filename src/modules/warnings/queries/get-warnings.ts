import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import {
  computeWarningStatus,
  scopeToVisibility,
  typeToWarningType,
} from '../lib/warning-mappers';
import type { Warning } from '../types/warnings';

export async function getWarnings(): Promise<Warning[]> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();

  const rows = await db.announcement.findMany({
    where: {
      academyId: academy.id,
      visibilityScope: { in: ['ALL', 'STUDENTS', 'INSTRUCTORS'] },
    },
    orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    select: {
      id: true,
      title: true,
      content: true,
      type: true,
      visibilityScope: true,
      publishedAt: true,
      expiresAt: true,
      createdAt: true,
      updatedAt: true,
      createdBy: {
        select: { name: true },
      },
    },
  });

  return rows.map((row) => {
    const publishedAt = row.publishedAt;
    const expiresAt = row.expiresAt;

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      type: typeToWarningType(row.type),
      visibility: scopeToVisibility(row.visibilityScope),
      status: computeWarningStatus(publishedAt, expiresAt, now),
      publishedAt,
      expiresAt,
      createdByName: row.createdBy.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  });
}
