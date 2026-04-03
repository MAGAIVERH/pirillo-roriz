import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type ClassListItem = {
  id: string;
  name: string;
  type: string;
  instructor: string;
  capacity: string;
  schedules: string[];
  schedulesCount: number;
  active: boolean;
  enrollmentsCount: number;
};

const weekDayMap: Record<string, string> = {
  SUNDAY: 'Dom',
  MONDAY: 'Seg',
  TUESDAY: 'Ter',
  WEDNESDAY: 'Qua',
  THURSDAY: 'Qui',
  FRIDAY: 'Sex',
  SATURDAY: 'Sáb',
};

export const getClassesList = async (): Promise<ClassListItem[]> => {
  const academy = await getOrCreateDefaultAcademy();

  const classes = await db.class.findMany({
    where: {
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return classes.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.classType.name,
    instructor: item.instructor?.fullName || 'Sem professor vinculado',
    capacity: item.capacity ? `${item.capacity} vagas` : 'Não definida',
    schedules:
      item.schedules.length > 0
        ? item.schedules.map(
            (schedule) =>
              `${weekDayMap[schedule.weekDay]} • ${schedule.startTime} às ${
                schedule.endTime
              }`,
          )
        : ['Sem horários cadastrados'],
    schedulesCount: item.schedules.length,
    active: item.active,
    enrollmentsCount: item.enrollments.length,
  }));
};
