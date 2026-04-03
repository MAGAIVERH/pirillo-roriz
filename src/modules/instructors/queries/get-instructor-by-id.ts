import { notFound } from 'next/navigation';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const formatPhone = (value: string | null) => {
  if (!value) {
    return '';
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

export const getInstructorById = async (instructorId: string) => {
  const academy = await getOrCreateDefaultAcademy();

  const instructor = await db.instructor.findFirst({
    where: {
      id: instructorId,
      academyId: academy.id,
    },
    include: {
      classes: {
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  if (!instructor) {
    notFound();
  }

  return {
    id: instructor.id,
    fullName: instructor.fullName,
    email: instructor.email ?? '',
    phone: formatPhone(instructor.phone),
    active: instructor.active,
    birthDate: instructor.birthDate
      ? instructor.birthDate.toISOString().split('T')[0]
      : '',
    age: calculateAge(instructor.birthDate),
    belt: instructor.belt ?? '',
    beltDegree: instructor.beltDegree ?? 0,
    notes: instructor.notes ?? '',
    classesCount: instructor.classes.length,
    classes: instructor.classes,
    createdAt: instructor.createdAt.toLocaleDateString('pt-BR'),
  };
};
