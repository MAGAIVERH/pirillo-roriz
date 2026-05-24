import { AttendanceStatus } from '@/generated/prisma/client';
import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import { buildStudentQrPayload } from '@/modules/attendance/lib/qr-token';
import { ensureStudentQrToken } from '@/modules/attendance/lib/ensure-student-qr-token';

export type StudentAttendancePortalItem = {
  id: string;
  date: string;
  dateLabel: string;
  status: AttendanceStatus;
  source: string;
  className: string;
};

export type StudentAttendancePortalOverview = {
  qrPayload: string;
  stats: {
    attendancesSincePromotion: number;
    absencesSincePromotion: number;
    monthPresentCount: number;
    monthAbsentCount: number;
  };
  recentAttendances: StudentAttendancePortalItem[];
};

const sourceLabelMap: Record<string, string> = {
  MANUAL: 'Manual',
  QR_CODE: 'QR Code',
  ADMIN_ADJUSTMENT: 'Admin',
};

export function getAttendanceSourceLabel(source: string): string {
  return sourceLabelMap[source] ?? source;
}

export async function getStudentAttendancePortalOverview(
  studentId: string,
): Promise<StudentAttendancePortalOverview> {
  const academy = await getOrCreateDefaultAcademy();

  await ensureStudentQrToken(studentId, academy.id);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [progress, attendances] = await Promise.all([
    db.studentProgress.findFirst({
      where: {
        studentId,
        academyId: academy.id,
      },
      select: {
        attendancesSincePromotion: true,
        absencesSincePromotion: true,
      },
    }),
    db.attendance.findMany({
      where: {
        studentId,
        student: {
          academyId: academy.id,
        },
      },
      orderBy: {
        classSession: {
          sessionDate: 'desc',
        },
      },
      take: 30,
      select: {
        id: true,
        status: true,
        source: true,
        classSession: {
          select: {
            sessionDate: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const monthAttendances = attendances.filter((item) => {
    return item.classSession.sessionDate >= monthStart;
  });

  const monthPresentCount = monthAttendances.filter(
    (item) =>
      item.status === AttendanceStatus.PRESENT ||
      item.status === AttendanceStatus.LATE,
  ).length;

  const monthAbsentCount = monthAttendances.filter(
    (item) => item.status === AttendanceStatus.ABSENT,
  ).length;

  return {
    qrPayload: buildStudentQrPayload(studentId, academy.id),
    stats: {
      attendancesSincePromotion: progress?.attendancesSincePromotion ?? 0,
      absencesSincePromotion: progress?.absencesSincePromotion ?? 0,
      monthPresentCount,
      monthAbsentCount,
    },
    recentAttendances: attendances.map((item) => ({
      id: item.id,
      date: item.classSession.sessionDate.toISOString().split('T')[0],
      dateLabel: item.classSession.sessionDate.toLocaleDateString('pt-BR'),
      status: item.status,
      source: getAttendanceSourceLabel(item.source),
      className: item.classSession.class.name,
    })),
  };
}
