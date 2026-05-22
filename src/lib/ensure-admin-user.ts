import { randomUUID } from 'node:crypto';

import { AppRole } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

type EnsureAdminResult = {
  created: boolean;
  email: string;
};

/**
 * Garante que o admin master da academia padrão exista, idempotente.
 *
 * - Lê `ADMIN_EMAIL`, `ADMIN_PASSWORD` e `ADMIN_NAME` do ambiente.
 * - Se o `User` com esse email não existir, cria User + Account (credential)
 *   + UserRoleAssignment(ADMIN_MASTER).
 * - Se já existir, garante apenas o vínculo de role (sem alterar senha).
 *
 * NÃO sobrescreve a senha se o admin já tiver trocado pelo painel.
 * A `ADMIN_PASSWORD` do .env serve apenas como bootstrap inicial.
 */
export async function ensureAdminUser(): Promise<EnsureAdminResult> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Admin Master';

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL e ADMIN_PASSWORD precisam estar configurados no .env',
    );
  }

  const academy = await getOrCreateDefaultAcademy();

  const existing = await db.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    await db.userRoleAssignment.upsert({
      where: {
        academyId_userId_role: {
          academyId: academy.id,
          userId: existing.id,
          role: AppRole.ADMIN_MASTER,
        },
      },
      create: {
        academyId: academy.id,
        userId: existing.id,
        role: AppRole.ADMIN_MASTER,
      },
      update: {},
    });

    return { created: false, email };
  }

  const ctx = await auth.$context;
  const hashedPassword = await ctx.password.hash(password);

  const now = new Date();
  const userId = randomUUID();

  await db.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        id: userId,
        name,
        email,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    });

    await tx.account.create({
      data: {
        id: randomUUID(),
        userId,
        accountId: userId,
        providerId: 'credential',
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      },
    });

    await tx.userRoleAssignment.create({
      data: {
        academyId: academy.id,
        userId,
        role: AppRole.ADMIN_MASTER,
      },
    });
  });

  return { created: true, email };
}
