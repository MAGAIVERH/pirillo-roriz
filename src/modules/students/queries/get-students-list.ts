import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import type { StudentListItem } from '@/modules/students/types/student-list-item';

const formatPhone = (value: string | null) => {
  if (!value) {
    return '-';
  }

  const digits = value.replace(/\D/g, '');

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(
      7,
      11,
    )}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(
      6,
      10,
    )}`;
  }

  return value;
};

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

export const getStudentsList = async (): Promise<StudentListItem[]> => {
  const academy = await getOrCreateDefaultAcademy();

  const students = await db.student.findMany({
    where: {
      academyId: academy.id,
      status: {
        not: 'LEAD',
      },
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
          startDate: 'desc',
        },
        take: 1,
      },
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  });

  return students.map((student) => ({
    id: student.id,
    fullName: student.preferredName || student.fullName,
    email: student.email || '-',
    phone: formatPhone(student.phone),
    belt: student.beltStatus?.currentBelt?.name || '-',
    age: calculateAge(student.birthDate),
    status: student.status,
    joinDate: student.joinDate
      ? new Date(student.joinDate).toLocaleDateString('pt-BR')
      : '-',
    className: student.enrollments[0]?.class?.name || '-',
  }));
};
