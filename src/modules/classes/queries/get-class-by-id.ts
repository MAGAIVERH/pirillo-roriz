import { notFound } from 'next/navigation';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const weekDayMap: Record<string, string> = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
};

export const getClassById = async (classId: string) => {
  const academy = await getOrCreateDefaultAcademy();

  const foundClass = await db.class.findFirst({
    where: {
      id: classId,
      academyId: academy.id,
    },
    include: {
      classType: true,
      instructor: true,
      schedules: {
        orderBy: [
          {
            weekDay: 'asc',
          },
          {
            startTime: 'asc',
          },
        ],
      },
      enrollments: {
        where: {
          status: 'ACTIVE',
        },
        select: {
          id: true,
        },
      },
    },
  });

  if (!foundClass) {
    notFound();
  }

  const availableInstructors = await db.instructor.findMany({
    where: {
      academyId: academy.id,
      active: true,
    },
    orderBy: {
      fullName: 'asc',
    },
    select: {
      id: true,
      fullName: true,
    },
  });

  return {
    id: foundClass.id,
    name: foundClass.name,
    description: foundClass.description || '-',
    type: foundClass.classType.name,
    instructor: foundClass.instructor?.fullName || 'Sem professor vinculado',
    instructorId: foundClass.instructorId ?? '',
    availableInstructors,
    capacity: foundClass.capacity,
    capacityLabel: foundClass.capacity
      ? `${foundClass.capacity} vagas`
      : 'Não definida',
    active: foundClass.active,
    enrollmentsCount: foundClass.enrollments.length,
    schedules: foundClass.schedules.map((schedule) => ({
      id: schedule.id,
      weekDay: schedule.weekDay,
      weekDayLabel: weekDayMap[schedule.weekDay],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })),
  };
};
