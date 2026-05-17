import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import type { AnnouncementScope } from '@/generated/prisma/client';

import {
  computeWarningStatus,
  scopeToVisibility,
  typeToWarningType,
} from '../lib/warning-mappers';
import type { WarningType, WarningVisibility } from '../types/warnings';

export type WarningCatalogItem = {
  id: string;
  title: string;
  content: string;
  type: WarningType;
  visibility: WarningVisibility;
  publishedAt: Date;
  expiresAt: Date | null;
};

type CatalogAudience = 'student' | 'instructor';

const scopeFilter: Record<CatalogAudience, AnnouncementScope[]> = {
  student: ['ALL', 'STUDENTS'],
  instructor: ['ALL', 'INSTRUCTORS'],
};

/** Avisos visíveis nas plataformas de aluno ou professor. */
export async function getWarningsCatalog(
  audience: CatalogAudience,
): Promise<WarningCatalogItem[]> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();

  const rows = await db.announcement.findMany({
    where: {
      academyId: academy.id,
      visibilityScope: { in: scopeFilter[audience] },
      publishedAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      content: true,
      type: true,
      visibilityScope: true,
      publishedAt: true,
      expiresAt: true,
    },
  });

  return rows
    .filter((row) => {
      const status = computeWarningStatus(row.publishedAt, row.expiresAt, now);
      return status === 'ativo';
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      type: typeToWarningType(row.type),
      visibility: scopeToVisibility(row.visibilityScope),
      publishedAt: row.publishedAt!,
      expiresAt: row.expiresAt,
    }));
}
