'use server';

import { revalidatePath } from 'next/cache';

import {
  EnrollmentStatus,
  Gender,
  StudentGoal,
  StudentStatus,
} from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import {
  createStudentSchema,
  type CreateStudentSchema,
} from '@/modules/students/schemas/create-student-schema';

type CreateStudentActionResult = {
  success: boolean;
  message: string;
  studentId?: string;
};

const genderMap: Record<string, Gender> = {
  male: Gender.MALE,
  female: Gender.FEMALE,
  other: Gender.OTHER,
  'prefer-not-to-say': Gender.PREFER_NOT_TO_SAY,
};

const statusMap: Record<string, StudentStatus> = {
  lead: StudentStatus.LEAD,
  trial: StudentStatus.TRIAL,
  active: StudentStatus.ACTIVE,
};

const goalMap: Record<string, StudentGoal> = {
  health: StudentGoal.HEALTH,
  'self-defense': StudentGoal.SELF_DEFENSE,
  competition: StudentGoal.COMPETITION,
  hobby: StudentGoal.HOBBY,
};

export const createStudentAction = async (
  input: CreateStudentSchema,
): Promise<CreateStudentActionResult> => {
  const parsed = createStudentSchema.safeParse(input);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos.';
    return {
      success: false,
      message: firstError,
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const [belt, mainClass, leadSource] = await Promise.all([
      db.belt.findFirst({
        where: {
          id: parsed.data.beltId,
          academyId: academy.id,
          active: true,
        },
        select: {
          id: true,
        },
      }),
      db.class.findFirst({
        where: {
          id: parsed.data.mainClassId,
          academyId: academy.id,
          active: true,
        },
        select: {
          id: true,
        },
      }),
      db.leadSource.findFirst({
        where: {
          id: parsed.data.leadSourceId,
          academyId: academy.id,
          active: true,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (!belt) {
      return {
        success: false,
        message: 'Não foi possível localizar a faixa inicial.',
      };
    }

    if (!mainClass) {
      return {
        success: false,
        message: 'Não foi possível localizar a turma principal.',
      };
    }

    if (!leadSource) {
      return {
        success: false,
        message: 'Não foi possível localizar a origem do aluno.',
      };
    }

    const normalizedPhone = parsed.data.phone.replace(/\D/g, '');
    const mappedGender = genderMap[parsed.data.gender];
    const mappedStatus = statusMap[parsed.data.status];
    const mappedGoal = goalMap[parsed.data.goal];
    const now = new Date();
    const hasPreviousExperience = parsed.data.studentHistoryType === 'existing';
    const progressionStartDate = new Date(parsed.data.progressionStartDate);

    const student = await db.$transaction(async (tx) => {
      const createdStudent = await tx.student.create({
        data: {
          academyId: academy.id,
          fullName: parsed.data.fullName,
          preferredName: parsed.data.preferredName || null,
          birthDate: parsed.data.birthDate,
          email: parsed.data.email,
          phone: normalizedPhone,
          gender: mappedGender,
          status: mappedStatus,
          joinDate: progressionStartDate,
          leadSourceId: leadSource.id,
          goal: mappedGoal,
          hasPreviousExperience,
          notes: parsed.data.notes || null,
        },
      });

      await tx.studentBeltStatus.create({
        data: {
          studentId: createdStudent.id,
          currentBeltId: belt.id,
          promotedAt: progressionStartDate,
        },
      });

      await tx.studentStatusHistory.create({
        data: {
          studentId: createdStudent.id,
          toStatus: mappedStatus,
          changedAt: now,
        },
      });

      if (mappedStatus !== StudentStatus.LEAD) {
        await tx.enrollment.create({
          data: {
            studentId: createdStudent.id,
            classId: mainClass.id,
            startDate: now,
            status: EnrollmentStatus.ACTIVE,
          },
        });
      }

      return createdStudent;
    });

    revalidatePath('/admin/alunos');
    revalidatePath('/admin/alunos/novo');

    return {
      success: true,
      message: 'Aluno salvo com sucesso no banco.',
      studentId: student.id,
    };
  } catch (error) {
    console.error('createStudentAction error', error);

    return {
      success: false,
      message: 'Não foi possível salvar o aluno no banco.',
    };
  }
};
