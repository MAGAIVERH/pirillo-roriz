'use server';

import { revalidatePath } from 'next/cache';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import {
  CreateGraduationRuleFormData,
  createGraduationRuleSchema,
} from '../schema/create-graduation-rule-schema';

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

export const createGraduationRuleAction = async (
  input: CreateGraduationRuleFormData,
) => {
  const parsed = createGraduationRuleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

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

    const displayOrderAggregate = await db.graduationRule.aggregate({
      where: {
        academyId: academy.id,
        program: parsed.data.program,
      },
      _max: {
        displayOrder: true,
      },
    });

    await db.graduationRule.create({
      data: {
        academyId: academy.id,
        program: parsed.data.program,
        currentBeltId: currentBelt.id,
        currentDegreeId: normalizedCurrentDegreeId,
        minAge: normalizedMinAge,
        maxAge: null,
        minimumMonths: normalizedMinimumMonths,
        minimumAttendances: 0,
        nextBeltId: nextBelt.id,
        nextDegreeId: normalizedNextDegreeId,
        active: parsed.data.status === 'ACTIVE',
        displayOrder: (displayOrderAggregate._max.displayOrder ?? 0) + 1,
        source: 'GRACIE_BARRA_BASE',
      },
    });

    revalidatePath('/admin/graduacao/regras');

    return {
      success: true,
      message: 'Regra de graduação cadastrada com sucesso.',
    };
  } catch (error) {
    console.error('createGraduationRuleAction error', error);

    return {
      success: false,
      message: 'Não foi possível cadastrar a regra de graduação.',
    };
  }
};
