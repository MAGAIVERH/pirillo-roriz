import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import type { InstructorWarningsPageData } from '@/modules/instructor-portal/types/instructor-warnings';
import {
  computeWarningStatus,
  scopeToVisibility,
  typeToWarningType,
} from '@/modules/warnings/lib/warning-mappers';
import type { WarningVisibility } from '@/modules/warnings/types/warnings';

const visibilityLabels: Record<WarningVisibility, string> = {
  todos: 'Todos',
  alunos: 'Alunos',
  professores: 'Professores',
};

function buildClassAudienceLabel(classNames: string[]): string {
  if (classNames.length === 0) {
    return 'Meus alunos';
  }

  if (classNames.length === 1) {
    return classNames[0];
  }

  return `Meus alunos · ${classNames.length} turmas`;
}

export async function getInstructorWarningsPage(
  instructorId: string,
  userId: string,
): Promise<InstructorWarningsPageData> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();

  const [academyRows, myRows, classes] = await Promise.all([
    db.announcement.findMany({
      where: {
        academyId: academy.id,
        visibilityScope: { in: ['ALL', 'INSTRUCTORS'] },
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
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    }),
    db.announcement.findMany({
      where: {
        academyId: academy.id,
        createdByUserId: userId,
        visibilityScope: 'CLASS_ONLY',
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        publishedAt: true,
        expiresAt: true,
        createdBy: {
          select: {
            name: true,
          },
        },
        targets: {
          where: {
            class: {
              instructorId,
            },
          },
          select: {
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
    db.class.findMany({
      where: {
        academyId: academy.id,
        instructorId,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  const academyWarnings = academyRows
    .filter((row) => {
      const status = computeWarningStatus(row.publishedAt, row.expiresAt, now);
      return status === 'ativo';
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      type: typeToWarningType(row.type),
      source: 'academy' as const,
      audienceLabel: visibilityLabels[scopeToVisibility(row.visibilityScope)],
      publishedAt: row.publishedAt!,
      expiresAt: row.expiresAt,
      createdByName: row.createdBy.name,
      canDelete: false,
    }));

  const myWarnings = myRows
    .filter((row) => {
      if (row.targets.length === 0) {
        return false;
      }

      const status = computeWarningStatus(row.publishedAt, row.expiresAt, now);
      return status === 'ativo';
    })
    .map((row) => {
      const classNames = [
        ...new Set(
          row.targets
            .map((target) => target.class?.name)
            .filter((name): name is string => Boolean(name)),
        ),
      ];

      return {
        id: row.id,
        title: row.title,
        content: row.content,
        type: typeToWarningType(row.type),
        source: 'mine' as const,
        audienceLabel: buildClassAudienceLabel(classNames),
        publishedAt: row.publishedAt!,
        expiresAt: row.expiresAt,
        createdByName: row.createdBy.name,
        canDelete: true,
      };
    });

  return {
    academyWarnings,
    myWarnings,
    classes,
    stats: {
      academyCount: academyWarnings.length,
      myCount: myWarnings.length,
    },
  };
}
