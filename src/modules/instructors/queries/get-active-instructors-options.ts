import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type ActiveInstructorOption = {
  id: string;
  fullName: string;
};

export async function getActiveInstructorsOptions(): Promise<
  ActiveInstructorOption[]
> {
  const academy = await getOrCreateDefaultAcademy();

  return db.instructor.findMany({
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
}
