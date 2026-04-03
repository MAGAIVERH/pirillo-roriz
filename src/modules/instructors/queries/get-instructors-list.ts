import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type InstructorListItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'INACTIVE';
  classesCount: number;
  createdAt: string;
};

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

export const getInstructorsList = async (): Promise<InstructorListItem[]> => {
  const academy = await getOrCreateDefaultAcademy();

  const instructors = await db.instructor.findMany({
    where: {
      academyId: academy.id,
    },
    include: {
      classes: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return instructors.map((item) => ({
    id: item.id,
    fullName: item.fullName,
    email: item.email ?? '-',
    phone: formatPhone(item.phone),
    status: item.active ? 'ACTIVE' : 'INACTIVE',
    classesCount: item.classes.length,
    createdAt: item.createdAt.toLocaleDateString('pt-BR'),
  }));
};
