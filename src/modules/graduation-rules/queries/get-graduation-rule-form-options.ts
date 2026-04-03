import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export const getGraduationRuleFormOptions = async () => {
  const academy = await getOrCreateDefaultAcademy();

  const belts = await db.belt.findMany({
    where: {
      academyId: academy.id,
      active: true,
    },
    include: {
      degrees: {
        orderBy: {
          degreeNumber: 'asc',
        },
        select: {
          id: true,
          degreeNumber: true,
        },
      },
    },
    orderBy: {
      sortOrder: 'asc',
    },
  });

  return belts.map((belt) => ({
    id: belt.id,
    name: belt.name,
    color: belt.color,
    sortOrder: belt.sortOrder,
    adultCategory: belt.adultCategory,
    juvenileCategory: belt.juvenileCategory,
    degrees: belt.degrees.map((degree) => ({
      id: degree.id,
      degreeNumber: degree.degreeNumber,
    })),
  }));
};
