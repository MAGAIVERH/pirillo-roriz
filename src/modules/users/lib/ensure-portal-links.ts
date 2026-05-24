import { AppRole } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type PortalAccess = {
  hasStudentAccess: boolean;
  hasInstructorAccess: boolean;
  hasAdminAccess: boolean;
};

export async function ensurePortalLinksForUser(
  userId: string,
  email: string,
): Promise<void> {
  const academy = await getOrCreateDefaultAcademy();
  const normalizedEmail = email.trim().toLowerCase();

  const [studentByEmail, instructorByEmail] = await Promise.all([
    db.student.findFirst({
      where: {
        academyId: academy.id,
        email: normalizedEmail,
      },
      select: { id: true, userId: true },
    }),
    db.instructor.findFirst({
      where: {
        academyId: academy.id,
        email: normalizedEmail,
      },
      select: { id: true, userId: true, active: true },
    }),
  ]);

  if (studentByEmail && studentByEmail.userId !== userId) {
    await db.student.update({
      where: { id: studentByEmail.id },
      data: { userId },
    });
  }

  if (instructorByEmail && instructorByEmail.userId !== userId) {
    await db.instructor.update({
      where: { id: instructorByEmail.id },
      data: { userId },
    });
  }

  const roleCreates: AppRole[] = [];

  if (studentByEmail) {
    roleCreates.push(AppRole.STUDENT);
  }

  if (instructorByEmail?.active) {
    roleCreates.push(AppRole.INSTRUCTOR);
  }

  for (const role of roleCreates) {
    await db.userRoleAssignment.upsert({
      where: {
        academyId_userId_role: {
          academyId: academy.id,
          userId,
          role,
        },
      },
      create: {
        academyId: academy.id,
        userId,
        role,
      },
      update: {},
    });
  }
}

export async function getPortalAccessForUser(
  userId: string,
  email: string,
): Promise<PortalAccess> {
  await ensurePortalLinksForUser(userId, email);

  const academy = await getOrCreateDefaultAcademy();

  const [roles, student, instructor] = await Promise.all([
    db.userRoleAssignment.findMany({
      where: {
        userId,
        academyId: academy.id,
      },
      select: { role: true },
    }),
    db.student.findFirst({
      where: {
        userId,
        academyId: academy.id,
      },
      select: { id: true },
    }),
    db.instructor.findFirst({
      where: {
        userId,
        academyId: academy.id,
        active: true,
      },
      select: { id: true },
    }),
  ]);

  const roleSet = new Set(roles.map((item) => item.role));

  return {
    hasAdminAccess: roleSet.has(AppRole.ADMIN) || roleSet.has(AppRole.ADMIN_MASTER),
    hasStudentAccess: roleSet.has(AppRole.STUDENT) && Boolean(student),
    hasInstructorAccess:
      roleSet.has(AppRole.INSTRUCTOR) && Boolean(instructor),
  };
}
