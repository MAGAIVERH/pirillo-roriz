import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export const getStudentAttendanceHistory = async (studentId: string) => {
  const academy = await getOrCreateDefaultAcademy();

  const attendances = await db.attendance.findMany({
    where: {
      studentId,
      student: {
        academyId: academy.id,
      },
    },
    include: {
      classSession: {
        select: {
          sessionDate: true,
          notes: true,
        },
      },
    },
    orderBy: {
      classSession: {
        sessionDate: 'desc',
      },
    },
  });

  return attendances.map((item) => ({
    id: item.id,
    date: item.classSession.sessionDate.toISOString().split('T')[0],
    dateLabel: item.classSession.sessionDate.toLocaleDateString('pt-BR'),
    status: item.status,
    source: item.source,
    notes: item.notes?.trim() || '-',
  }));
};
