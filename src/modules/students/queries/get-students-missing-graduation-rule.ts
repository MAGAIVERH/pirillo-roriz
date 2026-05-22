import { GraduationProgram } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type StudentMissingRule = {
  studentId: string;
  fullName: string;
  beltName: string;
  degreeNumber: number | null;
  isKids: boolean;
};

function calculateAge(birthDate: Date | null): number | null {
  if (!birthDate) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }
  return age;
}

/**
 * Detecta alunos ativos cuja combinação (faixa atual + grau + programa)
 * não possui nenhuma `GraduationRule` ativa cadastrada.
 *
 * Isso é um problema de configuração: sem regra, o aluno nunca poderá
 * ser marcado como ELIGIBLE pelo `calculateStudentProgress`.
 */
export async function getStudentsMissingGraduationRule(): Promise<
  StudentMissingRule[]
> {
  const academy = await getOrCreateDefaultAcademy();

  const students = await db.student.findMany({
    where: {
      academyId: academy.id,
      status: 'ACTIVE',
      beltStatus: { isNot: null },
    },
    select: {
      id: true,
      fullName: true,
      birthDate: true,
      beltStatus: {
        select: {
          currentBeltId: true,
          currentDegreeId: true,
          currentBelt: {
            select: { name: true, juvenileCategory: true },
          },
          currentDegree: { select: { degreeNumber: true } },
        },
      },
    },
  });

  const missing: StudentMissingRule[] = [];

  for (const student of students) {
    if (!student.beltStatus) continue;

    const program = student.beltStatus.currentBelt.juvenileCategory
      ? GraduationProgram.KIDS
      : GraduationProgram.ADULT;

    const age = calculateAge(student.birthDate);

    const rule = await db.graduationRule.findFirst({
      where: {
        academyId: academy.id,
        active: true,
        program,
        currentBeltId: student.beltStatus.currentBeltId,
        currentDegreeId: student.beltStatus.currentDegreeId ?? null,
        ...(program === GraduationProgram.KIDS && age !== null
          ? { OR: [{ minAge: null }, { minAge: { lte: age } }] }
          : {}),
      },
      select: { id: true },
    });

    if (!rule) {
      missing.push({
        studentId: student.id,
        fullName: student.fullName,
        beltName: student.beltStatus.currentBelt.name,
        degreeNumber: student.beltStatus.currentDegree?.degreeNumber ?? null,
        isKids: program === GraduationProgram.KIDS,
      });
    }
  }

  return missing.sort((a, b) => a.fullName.localeCompare(b.fullName));
}
