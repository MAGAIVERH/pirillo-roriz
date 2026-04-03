'use server';

import { revalidatePath } from 'next/cache';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import {
  CreateGraduationRuleFormData,
  createGraduationRuleSchema,
} from '../schema/create-graduation-rule-schema';

type UpdateGraduationRuleInput = CreateGraduationRuleFormData & {
  ruleId: string;
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

const isBlackBelt = (belt: { name: string; color: string }) => {
  const normalizedName = normalizeText(belt.name);
  const normalizedColor = normalizeText(belt.color);

  return (
    normalizedName.includes('preta') ||
    normalizedName.includes('preto') ||
    normalizedColor === 'black' ||
    normalizedColor === 'preta' ||
    normalizedColor === 'preto'
  );
};

export const updateGraduationRuleAction = async (
  input: UpdateGraduationRuleInput,
) => {
  const { ruleId, ...formData } = input;

  if (!ruleId?.trim()) {
    return {
      success: false,
      message: 'Regra inválida.',
    };
  }

  const parsed = createGraduationRuleSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const existingRule = await db.graduationRule.findFirst({
      where: {
        id: ruleId,
        academyId: academy.id,
      },
      select: {
        id: true,
      },
    });

    if (!existingRule) {
      return {
        success: false,
        message: 'Regra não encontrada.',
      };
    }

    const currentBelt = await db.belt.findFirst({
      where: {
        id: parsed.data.currentBeltId,
        academyId: academy.id,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    const nextBelt = await db.belt.findFirst({
      where: {
        id: parsed.data.nextBeltId,
        academyId: academy.id,
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    });

    if (!currentBelt || !nextBelt) {
      return {
        success: false,
        message: 'Faixa atual ou próxima faixa inválida.',
      };
    }

    const shouldUseCurrentDegree =
      parsed.data.program === 'ADULT' && isBlackBelt(currentBelt);
    const shouldUseNextDegree =
      parsed.data.program === 'ADULT' && isBlackBelt(nextBelt);

    const normalizedCurrentDegreeId =
      shouldUseCurrentDegree && parsed.data.currentDegreeId?.trim()
        ? parsed.data.currentDegreeId.trim()
        : null;

    const normalizedNextDegreeId =
      shouldUseNextDegree && parsed.data.nextDegreeId?.trim()
        ? parsed.data.nextDegreeId.trim()
        : null;

    if (normalizedCurrentDegreeId) {
      const currentDegree = await db.beltDegree.findFirst({
        where: {
          id: normalizedCurrentDegreeId,
          beltId: currentBelt.id,
        },
        select: {
          id: true,
        },
      });

      if (!currentDegree) {
        return {
          success: false,
          message: 'O grau atual não pertence à faixa atual.',
        };
      }
    }

    if (normalizedNextDegreeId) {
      const nextDegree = await db.beltDegree.findFirst({
        where: {
          id: normalizedNextDegreeId,
          beltId: nextBelt.id,
        },
        select: {
          id: true,
        },
      });

      if (!nextDegree) {
        return {
          success: false,
          message: 'O próximo grau não pertence à próxima faixa.',
        };
      }
    }

    const normalizedMinimumMonths = Number(parsed.data.minimumMonths);
    const normalizedMinAge =
      parsed.data.program === 'KIDS' && parsed.data.minimumAge?.trim()
        ? Number(parsed.data.minimumAge)
        : null;

    const duplicatedRule = await db.graduationRule.findFirst({
      where: {
        academyId: academy.id,
        id: {
          not: ruleId,
        },
        program: parsed.data.program,
        currentBeltId: currentBelt.id,
        currentDegreeId: normalizedCurrentDegreeId,
        nextBeltId: nextBelt.id,
        nextDegreeId: normalizedNextDegreeId,
        minimumMonths: normalizedMinimumMonths,
        minAge: normalizedMinAge,
      },
      select: {
        id: true,
      },
    });

    if (duplicatedRule) {
      return {
        success: false,
        message: 'Já existe uma regra igual cadastrada.',
      };
    }

    await db.graduationRule.update({
      where: {
        id: ruleId,
      },
      data: {
        program: parsed.data.program,
        currentBeltId: currentBelt.id,
        currentDegreeId: normalizedCurrentDegreeId,
        minAge: normalizedMinAge,
        maxAge: null,
        minimumMonths: normalizedMinimumMonths,
        nextBeltId: nextBelt.id,
        nextDegreeId: normalizedNextDegreeId,
        active: parsed.data.status === 'ACTIVE',
      },
    });

    revalidatePath('/admin/graduacao/regras');
    revalidatePath(`/admin/graduacao/regras/${ruleId}`);

    return {
      success: true,
      message: 'Regra de graduação atualizada com sucesso.',
    };
  } catch (error) {
    console.error('updateGraduationRuleAction error', error);

    return {
      success: false,
      message: 'Não foi possível atualizar a regra de graduação.',
    };
  }
};
