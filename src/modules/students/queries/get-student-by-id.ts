import { notFound } from 'next/navigation';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const calculateAge = (birthDate: Date | null) => {
  if (!birthDate) {
    return null;
  }

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
};

export const getStudentById = async (studentId: string) => {
  const academy = await getOrCreateDefaultAcademy();

  const student = await db.student.findFirst({
    where: {
      id: studentId,
      academyId: academy.id,
    },
    include: {
      beltStatus: {
        include: {
          currentBelt: true,
        },
      },
      enrollments: {
        where: {
          status: 'ACTIVE',
        },
        include: {
          class: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!student) {
    notFound();
  }

  const activeEnrollment = student.enrollments[0];

  return {
    id: student.id,
    fullName: student.fullName,
    email: student.email ?? '-',
    phone: student.phone ?? '-',
    age: calculateAge(student.birthDate),
    belt: student.beltStatus?.currentBelt?.name ?? 'Sem faixa',
    className: activeEnrollment?.class?.name ?? '-',
    joinDate: student.joinDate
      ? student.joinDate.toLocaleDateString('pt-BR')
      : '-',
    status: student.status,
  };
};
