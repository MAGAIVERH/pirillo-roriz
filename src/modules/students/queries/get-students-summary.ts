import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type StudentsSummary = {
  totalStudents: number;
  activeStudents: number;
  delinquentStudents: number;
  frozenStudents: number;
};

export const getStudentsSummary = async (): Promise<StudentsSummary> => {
  const academy = await getOrCreateDefaultAcademy();

  const [totalStudents, activeStudents, delinquentStudents, frozenStudents] =
    await Promise.all([
      db.student.count({
        where: {
          academyId: academy.id,
          status: {
            not: 'LEAD',
          },
        },
      }),
      db.student.count({
        where: {
          academyId: academy.id,
          status: 'ACTIVE',
        },
      }),
      db.student.count({
        where: {
          academyId: academy.id,
          status: 'DELINQUENT',
        },
      }),
      db.student.count({
        where: {
          academyId: academy.id,
          status: 'FROZEN',
        },
      }),
    ]);

  return {
    totalStudents,
    activeStudents,
    delinquentStudents,
    frozenStudents,
  };
};
