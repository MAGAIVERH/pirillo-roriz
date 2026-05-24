import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type InstructorDashboardStats = {
  classesCount: number;
  studentsCount: number;
  eligibleStudentsCount: number;
  delinquentStudentsCount: number;
};

export async function getInstructorDashboardStats(
  instructorId: string,
): Promise<InstructorDashboardStats> {
  const academy = await getOrCreateDefaultAcademy();

  const classes = await db.class.findMany({
    where: {
      academyId: academy.id,
      instructorId,
      active: true,
    },
    select: {
      id: true,
      enrollments: {
        where: {
          status: 'ACTIVE',
        },
        select: {
          student: {
            select: {
              id: true,
              status: true,
              progress: {
                select: {
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const studentMap = new Map<
    string,
    { status: string; progressStatus: string | null }
  >();

  for (const classItem of classes) {
    for (const enrollment of classItem.enrollments) {
      studentMap.set(enrollment.student.id, {
        status: enrollment.student.status,
        progressStatus: enrollment.student.progress?.status ?? null,
      });
    }
  }

  const students = [...studentMap.values()];

  return {
    classesCount: classes.length,
    studentsCount: students.length,
    eligibleStudentsCount: students.filter(
      (student) =>
        student.status === 'ACTIVE' && student.progressStatus === 'ELIGIBLE',
    ).length,
    delinquentStudentsCount: students.filter(
      (student) => student.status === 'DELINQUENT',
    ).length,
  };
}
