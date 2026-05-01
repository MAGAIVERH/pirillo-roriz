'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { createPlanSchema } from '../schemas/plan-schema';

type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const createPlanAction = async (input: CreatePlanInput) => {
  const parsed = createPlanSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    // Verifica se já existe um plano com o mesmo nome
    const existing = await db.plan.findFirst({
      where: {
        academyId: academy.id,
        name: parsed.data.name.trim(),
      },
      select: { id: true },
    });

    if (existing) {
      return {
        success: false,
        message: 'Já existe um plano com esse nome.',
      };
    }

    await db.plan.create({
      data: {
        academyId: academy.id,
        name: parsed.data.name.trim(),
        description: parsed.data.description?.trim() || null,
        priceInCents: parsed.data.priceInCents,
        billingCycle: parsed.data.billingCycle,
        active: true,
      },
    });

    revalidatePath('/admin/financeiro/planos');

    return {
      success: true,
      message: 'Plano criado com sucesso.',
    };
  } catch (error) {
    console.error('createPlanAction error', error);

    return {
      success: false,
      message: 'Não foi possível criar o plano.',
    };
  }
};
