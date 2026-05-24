import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export async function getStudentPortalNavCounts(
  userId: string,
  studentId: string,
): Promise<{ unreadWarnings: number }> {
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

  const announcements = await db.announcement.findMany({
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
    select: {
      id: true,
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

  const unreadWarnings = announcements.filter(
    (item) => item.reads.length === 0,
  ).length;

  return {
    unreadWarnings,
  };
}
