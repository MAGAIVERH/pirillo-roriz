import { randomUUID } from 'node:crypto';

import { AppRole } from '@/generated/prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateTemporaryPassword } from '@/lib/generate-temporary-password';
import { sendMail } from '@/lib/mail';

import {
  buildWelcomeEmail,
  type WelcomeEmailRole,
} from '../templates/welcome-email';

type ProvisionUserAccountInput = {
  fullName: string;
  email: string;
  academyId: string;
  role: AppRole;
  portalPath: '/admin' | '/professor' | '/aluno';
  welcomeRole: WelcomeEmailRole;
};

type ProvisionUserAccountResult = {
  success: boolean;
  userId?: string;
  emailSent: boolean;
  /**
   * `true` quando o helper encontrou um User existente com o mesmo email
   * e apenas adicionou o novo papel (sem regenerar senha nem enviar email).
   * Útil para a UI explicar ao admin que a conta já existia.
   */
  reusedExisting: boolean;
  message?: string;
};

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.BETTER_AUTH_URL ??
  'http://localhost:3000';

/**
 * Cria um usuário no sistema de autenticação, vincula um papel (role)
 * dentro da academia e envia o email de boas-vindas com senha provisória.
 *
 * - Se já existir `User` com o mesmo email, reaproveita e apenas garante
 *   o papel da academia, sem regenerar senha.
 * - Senha é hasheada usando o algoritmo configurado no Better-Auth, para
 *   permanecer compatível com o fluxo de login normal.
 */
export async function provisionUserAccount(
  input: ProvisionUserAccountInput,
): Promise<ProvisionUserAccountResult> {
  const normalizedEmail = input.email.trim().toLowerCase();

  if (!normalizedEmail) {
    return {
      success: false,
      emailSent: false,
      reusedExisting: false,
      message: 'Email inválido para criar conta de acesso.',
    };
  }

  const existing = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existing) {
    await db.userRoleAssignment.upsert({
      where: {
        academyId_userId_role: {
          academyId: input.academyId,
          userId: existing.id,
          role: input.role,
        },
      },
      create: {
        academyId: input.academyId,
        userId: existing.id,
        role: input.role,
      },
      update: {},
    });

    return {
      success: true,
      userId: existing.id,
      emailSent: false,
      reusedExisting: true,
      message:
        'Usuário já existia no sistema. Vínculo de papel adicionado, senha não foi alterada.',
    };
  }

  const ctx = await auth.$context;
  const password = generateTemporaryPassword();
  const hashedPassword = await ctx.password.hash(password);

  const now = new Date();
  const userId = randomUUID();

  await db.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        id: userId,
        name: input.fullName,
        email: normalizedEmail,
        emailVerified: false,
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
        academyId: input.academyId,
        userId,
        role: input.role,
      },
    });
  });

  const loginUrl = `${APP_URL.replace(/\/$/, '')}${input.portalPath}`;

  const email = buildWelcomeEmail({
    fullName: input.fullName,
    email: normalizedEmail,
    password,
    role: input.welcomeRole,
    loginUrl,
  });

  const mailResult = await sendMail({
    to: normalizedEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  return {
    success: true,
    userId,
    emailSent: mailResult.sent,
    reusedExisting: false,
    message: mailResult.sent
      ? 'Conta criada e email enviado.'
      : 'Conta criada, mas o email de boas-vindas não pôde ser enviado.',
  };
}
