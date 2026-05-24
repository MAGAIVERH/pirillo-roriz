import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export async function verifyInstructorStudentAccess(
  instructorId: string,
  studentId: string,
): Promise<boolean> {
  const academy = await getOrCreateDefaultAcademy();

  const enrollment = await db.enrollment.findFirst({
    where: {
      studentId,
      status: 'ACTIVE',
      class: {
        instructorId,
        academyId: academy.id,
      },
    },
    select: {
      id: true,
    },
  });

  return enrollment !== null;
}
