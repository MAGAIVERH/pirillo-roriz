'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { AppRole } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { findPersonByEmail } from '@/modules/users/lib/find-person-by-email';
import { provisionUserAccount } from '@/modules/users/lib/provision-user-account';

const createInstructorSchema = z.object({
  fullName: z
    .string()
    .min(3, 'O nome completo deve ter pelo menos 3 caracteres.'),
  birthDate: z.string().min(1, 'Selecione a data de nascimento.'),
  email: z.string().email('Digite um email válido.'),
  phone: z
    .string()
    .min(10, 'Digite um telefone válido.')
    .max(20, 'Digite um telefone válido.'),
  status: z.enum(['ACTIVE', 'INACTIVE'], {
    error: 'Selecione o status do professor.',
  }),
  belt: z.string().min(1, 'Selecione a faixa do professor.'),
  beltDegree: z.string().optional(),
  notes: z.string().optional(),
});

type CreateInstructorInput = z.infer<typeof createInstructorSchema>;

export const createInstructorAction = async (input: CreateInstructorInput) => {
  const parsed = createInstructorSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
    };
  }

  try {
    const academy = await getOrCreateDefaultAcademy();

    const normalizedEmail = parsed.data.email.trim().toLowerCase();
    const normalizedPhone = parsed.data.phone.replace(/\D/g, '');
    const normalizedDegree = parsed.data.beltDegree?.trim() ?? '';
    const degreeValue = normalizedDegree ? Number(normalizedDegree) : 0;

    if (!Number.isInteger(degreeValue) || degreeValue < 0 || degreeValue > 6) {
      return {
        success: false,
        message: 'O grau deve ser um número entre 0 e 6.',
      };
    }

    const existingInstructor = await db.instructor.findFirst({
      where: {
        academyId: academy.id,
        OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
      },
      select: {
        id: true,
      },
    });

    if (existingInstructor) {
      return {
        success: false,
        message:
          'Já existe um professor cadastrado com esse email ou telefone.',
      };
    }

    const fullName = parsed.data.fullName.trim();
    const existingPersonByEmail = await findPersonByEmail(
      academy.id,
      normalizedEmail,
    );

    const provisioning = await provisionUserAccount({
      fullName,
      email: normalizedEmail,
      academyId: academy.id,
      role: AppRole.INSTRUCTOR,
      portalPath: '/professor',
      welcomeRole: 'INSTRUCTOR',
    });

    if (!provisioning.success) {
      return {
        success: false,
        message:
          provisioning.message ??
          'Não foi possível criar o acesso do professor.',
      };
    }

    await db.instructor.create({
      data: {
        academyId: academy.id,
        userId: provisioning.userId,
        fullName,
        birthDate: new Date(parsed.data.birthDate),
        email: normalizedEmail,
        phone: normalizedPhone,
        active: parsed.data.status === 'ACTIVE',
        belt: parsed.data.belt.trim(),
        beltDegree: degreeValue,
        notes: parsed.data.notes?.trim() || null,
      },
    });

    revalidatePath('/admin/professores');

    const baseMessage = 'Professor cadastrado com sucesso.';
    let accessSuffix: string;

    if (provisioning.reusedExisting && provisioning.roleAdded) {
      accessSuffix = existingPersonByEmail.hasStudent
        ? ' Este email já pertence a um aluno — o acesso de professor foi liberado com o mesmo login e senha. Email de confirmação enviado.'
        : provisioning.emailSent
          ? ' Este email já tinha cadastro no sistema — o acesso de professor foi liberado com o mesmo login e senha. Email de confirmação enviado.'
          : ' Este email já tinha cadastro no sistema — o acesso de professor foi liberado com o mesmo login e senha, mas o email não pôde ser enviado.';
    } else if (provisioning.reusedExisting) {
      accessSuffix =
        ' Este email já tinha cadastro no sistema — o professor usa o mesmo login e senha do acesso existente.';
    } else if (provisioning.emailSent) {
      accessSuffix = ' Email com acesso provisório enviado.';
    } else {
      accessSuffix =
        ' Acesso criado, mas o email de boas-vindas não pôde ser enviado.';
    }

    return {
      success: true,
      message: `${baseMessage}${accessSuffix}`,
    };
  } catch (error) {
    console.error('createInstructorAction error', error);

    return {
      success: false,
      message: 'Não foi possível cadastrar o professor.',
    };
  }
};
