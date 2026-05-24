'use server';

import { revalidatePath } from 'next/cache';

import {
  AppRole,
  EnrollmentStatus,
  Gender,
  StudentGoal,
  StudentStatus,
} from '@/generated/prisma/client';
import { assertAdminAction } from '@/lib/admin-action';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { formatMailFailureSuffix } from '@/lib/mail';
import {
  createStudentSchema,
  type CreateStudentSchema,
} from '@/modules/students/schemas/create-student-schema';
import { findPersonByEmail } from '@/modules/users/lib/find-person-by-email';
import { provisionUserAccount } from '@/modules/users/lib/provision-user-account';

type CreateStudentActionResult = {
  success: boolean;
  message: string;
  studentId?: string;
  emailSent?: boolean;
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

/**
 * Calcula a data de vencimento da primeira fatura.
 * Usa o mês atual e o dia de vencimento do aluno.
 * Se o dia já passou no mês atual, gera para o próximo mês.
 */
function calcFirstDueDate(billingDueDay: number): Date {
  const now = new Date();
  const today = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Se o dia de vencimento ainda não chegou este mês, vence este mês
  // Se já passou, vence no próximo mês
  const targetMonth = today <= billingDueDay ? month : month + 1;

  return new Date(year, targetMonth, billingDueDay);
}

export const createStudentAction = async (
  input: CreateStudentSchema,
): Promise<CreateStudentActionResult> => {
  const parsed = createStudentSchema.safeParse(input);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Dados inválidos.';
    return { success: false, message: firstError };
  }

  const auth = await assertAdminAction();
  if (!auth.success) {
    return { success: false, message: auth.message };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const [belt, mainClass, leadSource, plan] = await Promise.all([
      db.belt.findFirst({
        where: { id: parsed.data.beltId, academyId: academy.id, active: true },
        select: { id: true },
      }),
      db.class.findFirst({
        where: {
          id: parsed.data.mainClassId,
          academyId: academy.id,
          active: true,
        },
        select: { id: true },
      }),
      db.leadSource.findFirst({
        where: {
          id: parsed.data.leadSourceId,
          academyId: academy.id,
          active: true,
        },
        select: { id: true },
      }),
      // Busca plano apenas se foi informado
      parsed.data.planId
        ? db.plan.findFirst({
            where: {
              id: parsed.data.planId,
              academyId: academy.id,
              active: true,
            },
            select: { id: true, priceInCents: true, name: true },
          })
        : Promise.resolve(null),
    ]);

    if (!belt)
      return {
        success: false,
        message: 'Não foi possível localizar a faixa inicial.',
      };
    if (!mainClass)
      return {
        success: false,
        message: 'Não foi possível localizar a turma principal.',
      };
    if (!leadSource)
      return {
        success: false,
        message: 'Não foi possível localizar a origem do aluno.',
      };
    if (parsed.data.planId && !plan)
      return {
        success: false,
        message: 'Não foi possível localizar o plano selecionado.',
      };

    const normalizedPhone = parsed.data.phone.replace(/\D/g, '');
    const normalizedEmail = parsed.data.email.trim().toLowerCase();

    const [existingStudentByContact, existingPersonByEmail] = await Promise.all([
      db.student.findFirst({
        where: {
          academyId: academy.id,
          OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
        },
        select: { id: true },
      }),
      findPersonByEmail(academy.id, normalizedEmail),
    ]);

    if (existingStudentByContact) {
      return {
        success: false,
        message: 'Já existe um aluno cadastrado com esse email ou telefone.',
      };
    }
    const mappedGender = genderMap[parsed.data.gender];
    const mappedStatus = statusMap[parsed.data.status];
    const mappedGoal = goalMap[parsed.data.goal];
    const now = new Date();
    const hasPreviousExperience = parsed.data.studentHistoryType === 'existing';
    const progressionStartDate = new Date(parsed.data.progressionStartDate);

    // Provisiona a conta de acesso ANTES de iniciar a transação para evitar
    // que o tempo de hash/envio de email estoure o timeout da transação Postgres.
    // Só cria conta quando o aluno entra como ACTIVE ou TRIAL — leads não recebem
    // login até o status mudar.
    const shouldProvisionAccess =
      mappedStatus === StudentStatus.ACTIVE ||
      mappedStatus === StudentStatus.TRIAL;

    const provisioning = shouldProvisionAccess
      ? await provisionUserAccount({
          fullName: parsed.data.fullName,
          email: normalizedEmail,
          academyId: academy.id,
          role: AppRole.STUDENT,
          portalPath: '/aluno',
          welcomeRole: 'STUDENT',
        })
      : null;

    if (provisioning && !provisioning.success) {
      return {
        success: false,
        message:
          provisioning.message ??
          'Não foi possível criar o acesso do aluno.',
      };
    }

    const student = await db.$transaction(async (tx) => {
      // 1. Cria o aluno
      const createdStudent = await tx.student.create({
        data: {
          academyId: academy.id,
          userId: provisioning?.userId ?? null,
          fullName: parsed.data.fullName,
          preferredName: parsed.data.preferredName || null,
          birthDate: parsed.data.birthDate,
          email: normalizedEmail,
          phone: normalizedPhone,
          gender: mappedGender,
          status: mappedStatus,
          joinDate: progressionStartDate,
          leadSourceId: leadSource.id,
          goal: mappedGoal,
          hasPreviousExperience,
          billingDueDay: parsed.data.billingDueDay,
          notes: parsed.data.notes || null,
        },
      });

      // 2. Cria status da faixa
      await tx.studentBeltStatus.create({
        data: {
          studentId: createdStudent.id,
          currentBeltId: belt.id,
          promotedAt: progressionStartDate,
        },
      });

      // 3. Registra histórico de status
      await tx.studentStatusHistory.create({
        data: {
          studentId: createdStudent.id,
          toStatus: mappedStatus,
          changedAt: now,
        },
      });

      // 4. Cria matrícula na turma (se não for lead)
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

      // 5. Se plano foi selecionado → cria subscription + primeira invoice
      if (plan) {
        const dueDate = calcFirstDueDate(parsed.data.billingDueDay);

        const subscription = await tx.studentSubscription.create({
          data: {
            studentId: createdStudent.id,
            planId: plan.id,
            startsAt: progressionStartDate,
            status: 'ACTIVE',
            priceInCents: plan.priceInCents,
            discountInCents: 0,
            billingDueDay: parsed.data.billingDueDay,
          },
        });

        await tx.invoice.create({
          data: {
            academyId: academy.id,
            studentId: createdStudent.id,
            subscriptionId: subscription.id,
            description: `Mensalidade — ${plan.name}`,
            amountInCents: plan.priceInCents,
            discountInCents: 0,
            fineInCents: 0,
            dueDate,
            status: 'PENDING',
          },
        });
      }

      return createdStudent;
    });

    revalidatePath('/admin/alunos');
    revalidatePath('/admin/financeiro');

    const baseMessage = plan
      ? 'Aluno salvo e plano vinculado com sucesso.'
      : 'Aluno salvo com sucesso no banco.';

    let accessSuffix: string;
    if (!provisioning) {
      accessSuffix = ' Acesso de aluno será criado quando o status virar Ativo.';
    } else if (provisioning.reusedExisting && provisioning.roleAdded) {
      accessSuffix = existingPersonByEmail.hasInstructor
        ? ' Este email já pertence a um professor — o acesso de aluno foi liberado com o mesmo login e senha. Email de confirmação enviado.'
        : provisioning.emailSent
          ? ' Este email já tinha cadastro no sistema — o acesso de aluno foi liberado com o mesmo login e senha. Email de confirmação enviado.'
          : ` Este email já tinha cadastro no sistema — o acesso de aluno foi liberado com o mesmo login e senha.${formatMailFailureSuffix(provisioning.mailFailureReason)}`;
    } else if (provisioning.reusedExisting) {
      accessSuffix =
        ' Este email já tinha cadastro no sistema — o aluno usa o mesmo login e senha do acesso existente.';
    } else if (provisioning.emailSent) {
      accessSuffix = ' Email com acesso provisório enviado.';
    } else {
      accessSuffix = formatMailFailureSuffix(provisioning.mailFailureReason);
    }

    return {
      success: true,
      message: `${baseMessage}${accessSuffix}`,
      studentId: student.id,
      emailSent: provisioning?.emailSent ?? false,
    };
  } catch (error) {
    console.error('createStudentAction error', error);
    return {
      success: false,
      message: 'Não foi possível salvar o aluno no banco.',
    };
  }
};
