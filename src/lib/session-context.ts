import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { AppRole } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type InstructorContext = {
  user: SessionUser;
  instructor: {
    id: string;
    fullName: string;
    email: string | null;
    belt: string | null;
    beltDegree: number | null;
  };
  academyId: string;
};

const ADMIN_ROLES: AppRole[] = [
  AppRole.ADMIN_MASTER,
  AppRole.ADMIN,
  AppRole.RECEPTION,
];

export async function getAuthSession(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };
}

export async function getUserRoles(
  userId: string,
  academyId: string,
): Promise<AppRole[]> {
  const roles = await db.userRoleAssignment.findMany({
    where: {
      userId,
      academyId,
    },
    select: {
      role: true,
    },
  });

  return roles.map((item) => item.role);
}

export async function requireInstructorContext(): Promise<InstructorContext> {
  const user = await getAuthSession();

  if (!user) {
    redirect('/professor/login');
  }

  const academy = await getOrCreateDefaultAcademy();

  const [instructorRole, instructor] = await Promise.all([
    db.userRoleAssignment.findFirst({
      where: {
        userId: user.id,
        academyId: academy.id,
        role: AppRole.INSTRUCTOR,
      },
      select: { id: true },
    }),
    db.instructor.findFirst({
      where: {
        userId: user.id,
        academyId: academy.id,
        active: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        belt: true,
        beltDegree: true,
      },
    }),
  ]);

  if (!instructorRole || !instructor) {
    redirect('/professor/login');
  }

  return {
    user,
    instructor,
    academyId: academy.id,
  };
}

export async function requireAdminSession(): Promise<SessionUser> {
  const user = await getAuthSession();

  if (!user) {
    redirect('/login');
  }

  const academy = await getOrCreateDefaultAcademy();
  const roles = await getUserRoles(user.id, academy.id);
  const hasAdminAccess = roles.some((role) => ADMIN_ROLES.includes(role));

  if (!hasAdminAccess) {
    redirect('/login');
  }

  return user;
}
