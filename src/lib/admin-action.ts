import { AppRole } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import {
  getAuthSession,
  getUserRoles,
  type SessionUser,
} from '@/lib/session-context';

const ADMIN_ROLES: AppRole[] = [
  AppRole.ADMIN_MASTER,
  AppRole.ADMIN,
  AppRole.RECEPTION,
];

export type AdminActionContext = {
  user: SessionUser;
  academyId: string;
};

export type AdminActionFailure = {
  success: false;
  message: string;
};

export type AdminActionSuccess = AdminActionContext & {
  success: true;
};

export type AdminActionResult = AdminActionSuccess | AdminActionFailure;

export async function assertAdminAction(): Promise<AdminActionResult> {
  const user = await getAuthSession();

  if (!user) {
    return {
      success: false,
      message: 'Sessão expirada. Faça login novamente.',
    };
  }

  const academy = await getOrCreateDefaultAcademy();
  const roles = await getUserRoles(user.id, academy.id);
  const hasAdminAccess = roles.some((role) => ADMIN_ROLES.includes(role));

  if (!hasAdminAccess) {
    return {
      success: false,
      message: 'Você não tem permissão para executar esta ação.',
    };
  }

  return {
    success: true,
    user,
    academyId: academy.id,
  };
}

export async function hasAdminAccess(userId: string): Promise<boolean> {
  const academy = await getOrCreateDefaultAcademy();
  const roles = await getUserRoles(userId, academy.id);

  return roles.some((role) => ADMIN_ROLES.includes(role));
}
