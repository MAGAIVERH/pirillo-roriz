import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type InstructorClassListItem = {
  id: string;
  name: string;
  type: string;
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

export async function getInstructorClasses(
  instructorId: string,
): Promise<InstructorClassListItem[]> {
  const academy = await getOrCreateDefaultAcademy();

  const classes = await db.class.findMany({
    where: {
      academyId: academy.id,
      instructorId,
    },
    select: {
      id: true,
      name: true,
      capacity: true,
      active: true,
      classType: {
        select: {
          name: true,
        },
      },
      schedules: {
        orderBy: [{ weekDay: 'asc' }, { startTime: 'asc' }],
        select: {
          weekDay: true,
          startTime: true,
          endTime: true,
        },
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
      name: 'asc',
    },
  });

  return classes.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.classType.name,
    capacity: item.capacity ? `${item.capacity} vagas` : 'Não definida',
    schedules:
      item.schedules.length > 0
        ? item.schedules.map(
            (schedule) =>
              `${weekDayMap[schedule.weekDay]} • ${schedule.startTime} às ${schedule.endTime}`,
          )
        : ['Sem horários cadastrados'],
    schedulesCount: item.schedules.length,
    active: item.active,
    enrollmentsCount: item.enrollments.length,
  }));
}
