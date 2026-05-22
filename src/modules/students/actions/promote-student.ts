'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { GraduationProgram, PromotionType } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { calculateStudentProgress } from '../lib/calcule-student-progress';

const promoteStudentSchema = z.object({
  studentId: z.string().min(1, 'Aluno inválido.'),
  approvedByInstructorId: z.string().optional(),
  notes: z.string().max(500, 'Observação muito longa.').optional(),
});

type PromoteStudentInput = z.infer<typeof promoteStudentSchema>;

type PromoteStudentResult = {
  success: boolean;
  message: string;
};

export async function promoteStudentAction(
  input: PromoteStudentInput,
): Promise<PromoteStudentResult> {
  const parsed = promoteStudentSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  const { studentId, approvedByInstructorId, notes } = parsed.data;

  try {
    const academy = await getOrCreateDefaultAcademy();

    const student = await db.student.findFirst({
      where: { id: studentId, academyId: academy.id },
      select: {
        id: true,
        birthDate: true,
        beltStatus: {
          select: {
            currentBeltId: true,
            currentDegreeId: true,
            currentBelt: { select: { name: true, juvenileCategory: true } },
            currentDegree: { select: { degreeNumber: true } },
          },
        },
        progress: {
          select: { status: true },
        },
      },
    });

    if (!student) {
      return { success: false, message: 'Aluno não encontrado.' };
    }

    if (!student.beltStatus) {
      return {
        success: false,
        message: 'Aluno não possui faixa atual cadastrada.',
      };
    }

    if (student.progress?.status !== 'ELIGIBLE') {
      return {
        success: false,
        message: 'Aluno ainda não está apto a graduar segundo o progresso atual.',
      };
    }

    const program = student.beltStatus.currentBelt.juvenileCategory
      ? GraduationProgram.KIDS
      : GraduationProgram.ADULT;

    let referenceAge: number | null = null;
    if (student.birthDate) {
      const today = new Date();
      referenceAge = today.getFullYear() - student.birthDate.getFullYear();
      const monthDiff = today.getMonth() - student.birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < student.birthDate.getDate())
      ) {
        referenceAge -= 1;
      }
    }

    const matchingRule = await db.graduationRule.findFirst({
      where: {
        academyId: academy.id,
        active: true,
        program,
        currentBeltId: student.beltStatus.currentBeltId,
        currentDegreeId: student.beltStatus.currentDegreeId ?? null,
        ...(program === GraduationProgram.KIDS && referenceAge !== null
          ? {
              OR: [{ minAge: null }, { minAge: { lte: referenceAge } }],
            }
          : {}),
      },
      orderBy: [{ minAge: 'asc' }, { displayOrder: 'asc' }],
      select: {
        id: true,
        nextBeltId: true,
        nextDegreeId: true,
        nextBelt: { select: { name: true } },
        nextDegree: { select: { degreeNumber: true } },
      },
    });

    if (!matchingRule) {
      return {
        success: false,
        message: 'Nenhuma regra de graduação compatível foi encontrada.',
      };
    }

    const fromBeltId = student.beltStatus.currentBeltId;
    const fromDegreeId = student.beltStatus.currentDegreeId;

    const promotionType =
      fromBeltId === matchingRule.nextBeltId
        ? PromotionType.DEGREE
        : PromotionType.BELT;

    const now = new Date();

    await db.$transaction(async (tx) => {
      await tx.graduationHistory.create({
        data: {
          studentId,
          fromBeltId,
          fromDegreeId,
          toBeltId: matchingRule.nextBeltId,
          toDegreeId: matchingRule.nextDegreeId,
          promotionType,
          promotedAt: now,
          approvedByInstructorId: approvedByInstructorId ?? null,
          notes: notes?.trim() || null,
        },
      });

      await tx.studentBeltStatus.update({
        where: { studentId },
        data: {
          currentBeltId: matchingRule.nextBeltId,
          currentDegreeId: matchingRule.nextDegreeId,
          promotedAt: now,
        },
      });
    });

    await calculateStudentProgress(studentId);

    revalidatePath('/admin');
    revalidatePath('/admin/alunos');
    revalidatePath(`/admin/alunos/${studentId}`);
    revalidatePath('/admin/analytics');
    revalidatePath('/admin/graduacao/regras');

    const nextLabel = matchingRule.nextDegree
      ? `${matchingRule.nextBelt.name} · ${matchingRule.nextDegree.degreeNumber}º grau`
      : matchingRule.nextBelt.name;

    return {
      success: true,
      message: `Aluno graduado para ${nextLabel} com sucesso.`,
    };
  } catch (error) {
    console.error('promoteStudentAction error', error);
    return {
      success: false,
      message: 'Não foi possível registrar a graduação. Tente novamente.',
    };
  }
}
