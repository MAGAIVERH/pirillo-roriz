import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export const getStudentFormOptions = async () => {
  const academy = await getOrCreateDefaultAcademy();

  const [belts, classes, leadSources] = await Promise.all([
    db.belt.findMany({
      where: {
        academyId: academy.id,
        active: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        name: true,
        adultCategory: true,
        juvenileCategory: true,
      },
    }),
    db.class.findMany({
      where: {
        academyId: academy.id,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    }),
    db.leadSource.findMany({
      where: {
        academyId: academy.id,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  return {
    belts,
    classes,
    leadSources,
  };
};
