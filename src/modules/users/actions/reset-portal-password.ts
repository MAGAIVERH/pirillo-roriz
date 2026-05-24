'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { assertAdminAction } from '@/lib/admin-action';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateTemporaryPassword } from '@/lib/generate-temporary-password';

const resetPortalPasswordSchema = z.object({
  email: z.string().email('Informe um email válido.'),
});

type ResetPortalPasswordResult = {
  success: boolean;
  message: string;
  temporaryPassword?: string;
};

export async function resetPortalPasswordAction(
  input: z.infer<typeof resetPortalPasswordSchema>,
): Promise<ResetPortalPasswordResult> {
  const parsed = resetPortalPasswordSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  const authResult = await assertAdminAction();

  if (!authResult.success) {
    return { success: false, message: authResult.message };
  }

  try {
    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true },
    });

    if (!user) {
      return {
        success: false,
        message: 'Nenhuma conta de acesso encontrada para este email.',
      };
    }

    const account = await db.account.findFirst({
      where: {
        userId: user.id,
        providerId: 'credential',
      },
      select: { id: true },
    });

    if (!account) {
      return {
        success: false,
        message: 'Esta conta não possui login por email e senha.',
      };
    }

    const ctx = await auth.$context;
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await ctx.password.hash(temporaryPassword);

    await db.account.update({
      where: { id: account.id },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/alunos');
    revalidatePath('/admin/professores');

    return {
      success: true,
      message: `Senha provisória redefinida para ${normalizedEmail}.`,
      temporaryPassword,
    };
  } catch (error) {
    console.error('resetPortalPasswordAction error', error);

    return {
      success: false,
      message: 'Não foi possível redefinir a senha.',
    };
  }
}
