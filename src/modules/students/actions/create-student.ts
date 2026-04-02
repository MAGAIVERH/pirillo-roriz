'use server';

import { revalidatePath } from 'next/cache';

import {
  EnrollmentStatus,
  Gender,
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

const beltNameMap: Record<string, string> = {
  white: 'Branca',
  blue: 'Azul',
  purple: 'Roxa',
  brown: 'Marrom',
  black: 'Preta',
};

const classNameMap: Record<string, string> = {
  'adulto-iniciante': 'Jiu-Jitsu Adulto Iniciante',
  kids: 'Jiu-Jitsu Kids',
  nogi: 'Jiu-Jitsu No-Gi',
  competicao: 'Jiu-Jitsu Competição',
};

const leadSourceNameMap: Record<string, string> = {
  instagram: 'Instagram',
  indication: 'Indicação',
  whatsapp: 'WhatsApp',
  street: 'Passagem em frente',
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

    const selectedBeltName = beltNameMap[parsed.data.belt];
    const selectedClassName = classNameMap[parsed.data.mainClass];
    const selectedLeadSourceName = leadSourceNameMap[parsed.data.leadSource];

    const [belt, mainClass, leadSource] = await Promise.all([
      db.belt.findFirst({
        where: {
          academyId: academy.id,
          name: selectedBeltName,
        },
      }),
      db.class.findFirst({
        where: {
          academyId: academy.id,
          name: selectedClassName,
        },
      }),
      db.leadSource.findFirst({
        where: {
          academyId: academy.id,
          name: selectedLeadSourceName,
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
    const now = new Date();

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
          joinDate: now,
          leadSourceId: leadSource.id,
          goal:
            parsed.data.goal === 'health'
              ? 'HEALTH'
              : parsed.data.goal === 'self-defense'
              ? 'SELF_DEFENSE'
              : parsed.data.goal === 'competition'
              ? 'COMPETITION'
              : 'HOBBY',
          notes: parsed.data.notes || null,
        },
      });

      await tx.studentBeltStatus.create({
        data: {
          studentId: createdStudent.id,
          currentBeltId: belt.id,
          promotedAt: now,
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
