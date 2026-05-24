import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { getAuthUserId } from '@/lib/get-auth-user-id';
import { db } from '@/lib/db';

export async function getWarningAuthorUserId(): Promise<string> {
  const sessionUserId = await getAuthUserId();

  if (sessionUserId) {
    return sessionUserId;
  }

  const academy = await getOrCreateDefaultAcademy();

  const adminAssignment = await db.userRoleAssignment.findFirst({
    where: {
      academyId: academy.id,
      role: { in: ['ADMIN', 'ADMIN_MASTER', 'RECEPTION'] },
    },
    select: { userId: true },
    orderBy: { createdAt: 'asc' },
  });

  if (adminAssignment) {
    return adminAssignment.userId;
  }

  throw new Error(
    'Não foi possível identificar o autor do aviso. Faça login novamente.',
  );
}
