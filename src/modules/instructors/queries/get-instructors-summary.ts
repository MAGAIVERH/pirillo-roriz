import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type InstructorsSummary = {
  totalInstructors: number;
  activeInstructors: number;
  inactiveInstructors: number;
  assignedInstructors: number;
};

export const getInstructorsSummary = async (): Promise<InstructorsSummary> => {
  const academy = await getOrCreateDefaultAcademy();

  const [
    totalInstructors,
    activeInstructors,
    inactiveInstructors,
    assignedInstructors,
  ] = await Promise.all([
    db.instructor.count({
      where: {
        academyId: academy.id,
      },
    }),
    db.instructor.count({
      where: {
        academyId: academy.id,
        active: true,
      },
    }),
    db.instructor.count({
      where: {
        academyId: academy.id,
        active: false,
      },
    }),
    db.instructor.count({
      where: {
        academyId: academy.id,
        classes: {
          some: {},
        },
      },
    }),
  ]);

  return {
    totalInstructors,
    activeInstructors,
    inactiveInstructors,
    assignedInstructors,
  };
};
