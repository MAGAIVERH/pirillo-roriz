import { AppRole } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { getAuthSession, getUserRoles } from '@/lib/session-context';
import { hasAdminAccess } from '@/lib/admin-action';

export async function resolveAuthenticatedHomePath(): Promise<string | null> {
  const user = await getAuthSession();

  if (!user) {
    return null;
  }

  if (await hasAdminAccess(user.id)) {
    return '/admin';
  }

  const academy = await getOrCreateDefaultAcademy();
  const roles = await getUserRoles(user.id, academy.id);

  if (roles.includes(AppRole.INSTRUCTOR)) {
    const instructor = await db.instructor.findFirst({
      where: {
        userId: user.id,
        academyId: academy.id,
        active: true,
      },
      select: { id: true },
    });

    if (instructor) {
      return '/professor';
    }
  }

  if (roles.includes(AppRole.STUDENT)) {
    const student = await db.student.findFirst({
      where: {
        userId: user.id,
        academyId: academy.id,
      },
      select: { id: true },
    });

    if (student) {
      return '/aluno';
    }
  }

  return null;
}
