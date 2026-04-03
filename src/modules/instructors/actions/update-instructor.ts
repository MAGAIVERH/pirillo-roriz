'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const updateInstructorSchema = z.object({
  instructorId: z.string().min(1, 'Professor inválido.'),
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

type UpdateInstructorInput = z.infer<typeof updateInstructorSchema>;

export const updateInstructorAction = async (input: UpdateInstructorInput) => {
  const parsed = updateInstructorSchema.safeParse(input);

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

    const foundInstructor = await db.instructor.findFirst({
      where: {
        id: parsed.data.instructorId,
        academyId: academy.id,
      },
      select: {
        id: true,
      },
    });

    if (!foundInstructor) {
      return {
        success: false,
        message: 'Professor não encontrado.',
      };
    }

    const existingInstructor = await db.instructor.findFirst({
      where: {
        academyId: academy.id,
        id: {
          not: parsed.data.instructorId,
        },
        OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
      },
      select: {
        id: true,
      },
    });

    if (existingInstructor) {
      return {
        success: false,
        message: 'Já existe outro professor com esse email ou telefone.',
      };
    }

    await db.instructor.update({
      where: {
        id: parsed.data.instructorId,
      },
      data: {
        fullName: parsed.data.fullName.trim(),
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
    revalidatePath(`/admin/professores/${parsed.data.instructorId}`);

    return {
      success: true,
      message: 'Professor atualizado com sucesso.',
    };
  } catch (error) {
    console.error('updateInstructorAction error', error);

    return {
      success: false,
      message: 'Não foi possível atualizar o professor.',
    };
  }
};
