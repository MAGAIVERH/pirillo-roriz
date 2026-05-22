import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

import { safeDivision } from '../lib/analytics-helpers';
import type {
  AnalyticsPeriod,
  InstructorPerformance,
} from '../types/analytics';

export async function getInstructorsPerformance(
  period: AnalyticsPeriod,
): Promise<InstructorPerformance[]> {
  const academy = await getOrCreateDefaultAcademy();

  const instructors = await db.instructor.findMany({
    where: { academyId: academy.id, active: true },
    select: {
      id: true,
      fullName: true,
      belt: true,
      beltDegree: true,
      classes: {
        select: {
          id: true,
          enrollments: {
            where: { status: 'ACTIVE' },
            select: { studentId: true },
          },
        },
      },
      classSessions: {
        where: {
          sessionDate: {
            gte: period.current.start,
            lte: period.current.end,
          },
        },
        select: {
          id: true,
          attendances: {
            select: {
              status: true,
            },
          },
        },
      },
    },
  });

  const previousAttendanceByInstructor = await db.attendance.groupBy({
    by: ['classSessionId'],
    where: {
      status: 'PRESENT',
      createdAt: {
        gte: period.previous.start,
        lte: period.previous.end,
      },
      classSession: { class: { academyId: academy.id } },
    },
    _count: { _all: true },
  });

  const previousSessionIdToCount = new Map(
    previousAttendanceByInstructor.map((entry) => [
      entry.classSessionId,
      entry._count._all,
    ]),
  );

  return instructors
    .map((instructor) => {
      const studentSet = new Set<string>();
      for (const cls of instructor.classes) {
        for (const enrollment of cls.enrollments) {
          studentSet.add(enrollment.studentId);
        }
      }

      const monthlyClasses = instructor.classSessions.length;

      let presentCount = 0;
      let totalAttendances = 0;
      for (const session of instructor.classSessions) {
        for (const attendance of session.attendances) {
          totalAttendances += 1;
          if (attendance.status === 'PRESENT') {
            presentCount += 1;
          }
        }
      }

      const attendanceRate =
        safeDivision(presentCount, totalAttendances) * 100;

      const previousPresent = instructor.classSessions.reduce((acc, session) => {
        return acc + (previousSessionIdToCount.get(session.id) ?? 0);
      }, 0);

      const retentionRate =
        previousPresent === 0
          ? attendanceRate
          : Math.min(safeDivision(presentCount, previousPresent) * 100, 100);

      const beltLabel = instructor.belt
        ? `${instructor.belt}${
            instructor.beltDegree ? ` · ${instructor.beltDegree}º` : ''
          }`
        : '—';

      return {
        id: instructor.id,
        fullName: instructor.fullName,
        beltLabel,
        studentsCount: studentSet.size,
        monthlyClasses,
        attendanceRate: Math.round(attendanceRate),
        retentionRate: Math.round(retentionRate),
      };
    })
    .sort((a, b) => b.studentsCount - a.studentsCount);
}
