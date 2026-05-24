import { AppRole, StudentStatus } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { provisionUserAccount } from './provision-user-account';

export type RepairPortalAccessResult = {
  success: boolean;
  message: string;
  studentsLinked: number;
  instructorsLinked: number;
  failures: string[];
};

export async function repairAllPortalAccess(): Promise<RepairPortalAccessResult> {
  const academy = await getOrCreateDefaultAcademy();
  const failures: string[] = [];
  let studentsLinked = 0;
  let instructorsLinked = 0;

  const [students, instructors] = await Promise.all([
    db.student.findMany({
      where: {
        academyId: academy.id,
        userId: null,
        status: { in: [StudentStatus.ACTIVE, StudentStatus.TRIAL] },
        email: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    }),
    db.instructor.findMany({
      where: {
        academyId: academy.id,
        userId: null,
        active: true,
        email: { not: null },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    }),
  ]);

  for (const student of students) {
    const email = student.email?.trim().toLowerCase();

    if (!email) {
      continue;
    }

    const provisioning = await provisionUserAccount({
      fullName: student.fullName,
      email,
      academyId: academy.id,
      role: AppRole.STUDENT,
      portalPath: '/aluno',
      welcomeRole: 'STUDENT',
    });

    if (!provisioning.success || !provisioning.userId) {
      failures.push(`Aluno ${student.fullName}: ${provisioning.message ?? 'falha ao provisionar'}`);
      continue;
    }

    await db.student.update({
      where: { id: student.id },
      data: { userId: provisioning.userId },
    });

    studentsLinked += 1;
  }

  for (const instructor of instructors) {
    const email = instructor.email?.trim().toLowerCase();

    if (!email) {
      continue;
    }

    const provisioning = await provisionUserAccount({
      fullName: instructor.fullName,
      email,
      academyId: academy.id,
      role: AppRole.INSTRUCTOR,
      portalPath: '/professor',
      welcomeRole: 'INSTRUCTOR',
    });

    if (!provisioning.success || !provisioning.userId) {
      failures.push(
        `Professor ${instructor.fullName}: ${provisioning.message ?? 'falha ao provisionar'}`,
      );
      continue;
    }

    await db.instructor.update({
      where: { id: instructor.id },
      data: { userId: provisioning.userId },
    });

    instructorsLinked += 1;
  }

  const totalLinked = studentsLinked + instructorsLinked;

  return {
    success: failures.length === 0,
    message:
      totalLinked > 0
        ? `${studentsLinked} aluno(s) e ${instructorsLinked} professor(es) vinculados ao login.`
        : 'Nenhum cadastro pendente de vínculo foi encontrado.',
    studentsLinked,
    instructorsLinked,
    failures,
  };
}
