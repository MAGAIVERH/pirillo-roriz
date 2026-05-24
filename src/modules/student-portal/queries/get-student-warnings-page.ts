import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import {
  computeWarningStatus,
  typeToWarningType,
} from '@/modules/warnings/lib/warning-mappers';
import type { WarningType } from '@/modules/warnings/types/warnings';

export type StudentWarningPageItem = {
  id: string;
  title: string;
  content: string;
  type: WarningType;
  audienceLabel: string;
  publishedAt: Date;
  expiresAt: Date | null;
  createdByName: string;
  isRead: boolean;
};

export async function getStudentWarningsPage(
  studentId: string,
  userId: string,
): Promise<StudentWarningPageItem[]> {
  const academy = await getOrCreateDefaultAcademy();
  const now = new Date();

  const enrollments = await db.enrollment.findMany({
    where: {
      studentId,
      status: 'ACTIVE',
      class: {
        academyId: academy.id,
      },
    },
    select: {
      classId: true,
    },
  });

  const classIds = enrollments.map((item) => item.classId);

  const rows = await db.announcement.findMany({
    where: {
      academyId: academy.id,
      publishedAt: { lte: now },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      AND: [
        {
          OR: [
            { visibilityScope: { in: ['ALL', 'STUDENTS'] } },
            {
              visibilityScope: 'CLASS_ONLY',
              OR: [
                {
                  targets: {
                    some: {
                      studentId,
                    },
                  },
                },
                {
                  targets: {
                    some: {
                      classId: { in: classIds },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
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
      targets: {
        select: {
          class: {
            select: {
              name: true,
            },
          },
        },
      },
      reads: {
        where: {
          userId,
        },
        select: {
          id: true,
        },
      },
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
      audienceLabel: getStudentAudienceLabel(row.visibilityScope, row.targets),
      publishedAt: row.publishedAt!,
      expiresAt: row.expiresAt,
      createdByName: row.createdBy.name,
      isRead: row.reads.length > 0,
    }));
}

function getStudentAudienceLabel(
  scope: string,
  targets: Array<{ class: { name: string } | null }>,
): string {
  if (scope === 'ALL') {
    return 'Todos';
  }

  if (scope === 'STUDENTS') {
    return 'Alunos';
  }

  const classNames = [
    ...new Set(
      targets
        .map((target) => target.class?.name)
        .filter((name): name is string => Boolean(name)),
    ),
  ];

  if (classNames.length === 0) {
    return 'Minha turma';
  }

  if (classNames.length === 1) {
    return classNames[0];
  }

  return `${classNames.length} turmas`;
}
