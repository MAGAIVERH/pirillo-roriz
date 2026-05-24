'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { requireStudentContext } from '@/lib/session-context';

const markStudentWarningReadSchema = z.object({
  announcementId: z.string().min(1, 'Aviso inválido.'),
});

type ActionResult = { success: boolean; message: string };

export async function markStudentWarningReadAction(
  input: z.infer<typeof markStudentWarningReadSchema>,
): Promise<ActionResult> {
  const parsed = markStudentWarningReadSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const { user, student } = await requireStudentContext();
    const academy = await getOrCreateDefaultAcademy();

    const announcement = await db.announcement.findFirst({
      where: {
        id: parsed.data.announcementId,
        academyId: academy.id,
      },
      select: {
        id: true,
      },
    });

    if (!announcement) {
      return {
        success: false,
        message: 'Aviso não encontrado.',
      };
    }

    await db.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId: announcement.id,
          userId: user.id,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        announcementId: announcement.id,
        userId: user.id,
      },
    });

    revalidatePath('/aluno');
    revalidatePath('/aluno/avisos');

    return {
      success: true,
      message: 'Aviso marcado como lido.',
    };
  } catch (error) {
    console.error('markStudentWarningReadAction error', error);

    return {
      success: false,
      message: 'Não foi possível marcar o aviso como lido.',
    };
  }
}

export async function markAllStudentWarningsReadAction(): Promise<ActionResult> {
  try {
    const { user, student } = await requireStudentContext();
    const academy = await getOrCreateDefaultAcademy();
    const now = new Date();

    const enrollments = await db.enrollment.findMany({
      where: {
        studentId: student.id,
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
                        studentId: student.id,
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
      },
    });

    if (announcements.length > 0) {
      await db.announcementRead.createMany({
        data: announcements.map((announcement) => ({
          announcementId: announcement.id,
          userId: user.id,
        })),
        skipDuplicates: true,
      });
    }

    revalidatePath('/aluno');
    revalidatePath('/aluno/avisos');

    return {
      success: true,
      message: 'Todos os avisos foram marcados como lidos.',
    };
  } catch (error) {
    console.error('markAllStudentWarningsReadAction error', error);

    return {
      success: false,
      message: 'Não foi possível marcar os avisos como lidos.',
    };
  }
}
