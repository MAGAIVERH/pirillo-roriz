import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type ClassesSummary = {
  totalClasses: number;
  activeClasses: number;
  classesWithInstructor: number;
  classesWithoutInstructor: number;
};

export const getClassesSummary = async (): Promise<ClassesSummary> => {
  const academy = await getOrCreateDefaultAcademy();

  const [
    totalClasses,
    activeClasses,
    classesWithInstructor,
    classesWithoutInstructor,
  ] = await Promise.all([
    db.class.count({
      where: {
        academyId: academy.id,
      },
    }),
    db.class.count({
      where: {
        academyId: academy.id,
        active: true,
      },
    }),
    db.class.count({
      where: {
        academyId: academy.id,
        instructorId: {
          not: null,
        },
      },
    }),
    db.class.count({
      where: {
        academyId: academy.id,
        instructorId: null,
      },
    }),
  ]);

  return {
    totalClasses,
    activeClasses,
    classesWithInstructor,
    classesWithoutInstructor,
  };
};
