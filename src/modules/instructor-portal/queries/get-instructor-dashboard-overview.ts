import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

const weekDayMap: Record<string, string> = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda',
  TUESDAY: 'Terça',
  WEDNESDAY: 'Quarta',
  THURSDAY: 'Quinta',
  FRIDAY: 'Sexta',
  SATURDAY: 'Sábado',
};

const jsDayToWeekDay = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
] as const;

export type InstructorTodayClassItem = {
  id: string;
  name: string;
  type: string;
  enrollmentsCount: number;
  schedules: string[];
};

export type InstructorAttentionStudent = {
  id: string;
  fullName: string;
  belt: string;
  className: string;
  classId: string;
  reason: 'eligible' | 'delinquent';
};

export type InstructorDashboardOverview = {
  stats: {
    classesCount: number;
    studentsCount: number;
    eligibleStudentsCount: number;
    delinquentStudentsCount: number;
  };
  todayClasses: InstructorTodayClassItem[];
  eligibleStudents: InstructorAttentionStudent[];
  delinquentStudents: InstructorAttentionStudent[];
};

export async function getInstructorDashboardOverview(
  instructorId: string,
): Promise<InstructorDashboardOverview> {
  const academy = await getOrCreateDefaultAcademy();
  const todayWeekDay = jsDayToWeekDay[new Date().getDay()];

  const classes = await db.class.findMany({
    where: {
      academyId: academy.id,
      instructorId,
      active: true,
    },
    select: {
      id: true,
      name: true,
      classType: { select: { name: true } },
      schedules: {
        where: { weekDay: todayWeekDay },
        select: { startTime: true, endTime: true, weekDay: true },
        orderBy: { startTime: 'asc' },
      },
      enrollments: {
        where: { status: 'ACTIVE' },
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true,
              beltStatus: {
                select: {
                  currentBelt: { select: { name: true } },
                },
              },
              progress: { select: { status: true } },
            },
          },
          class: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  const studentMap = new Map<
    string,
    {
      id: string;
      fullName: string;
      belt: string;
      className: string;
      classId: string;
      status: string;
      progressStatus: string | null;
    }
  >();

  for (const classItem of classes) {
    for (const enrollment of classItem.enrollments) {
      if (studentMap.has(enrollment.student.id)) continue;

      studentMap.set(enrollment.student.id, {
        id: enrollment.student.id,
        fullName: enrollment.student.fullName,
        belt: enrollment.student.beltStatus?.currentBelt?.name ?? 'Sem faixa',
        className: classItem.name,
        classId: classItem.id,
        status: enrollment.student.status,
        progressStatus: enrollment.student.progress?.status ?? null,
      });
    }
  }

  const students = [...studentMap.values()];

  const todayClasses: InstructorTodayClassItem[] = classes
    .filter((classItem) => classItem.schedules.length > 0)
    .map((classItem) => ({
      id: classItem.id,
      name: classItem.name,
      type: classItem.classType.name,
      enrollmentsCount: classItem.enrollments.length,
      schedules: classItem.schedules.map(
        (schedule) =>
          `${weekDayMap[schedule.weekDay]} · ${schedule.startTime}–${schedule.endTime}`,
      ),
    }));

  const eligibleStudents: InstructorAttentionStudent[] = [];
  const delinquentStudents: InstructorAttentionStudent[] = [];

  for (const student of students) {
    if (
      student.status === 'ACTIVE' &&
      student.progressStatus === 'ELIGIBLE'
    ) {
      eligibleStudents.push({
        id: student.id,
        fullName: student.fullName,
        belt: student.belt,
        className: student.className,
        classId: student.classId,
        reason: 'eligible',
      });
    } else if (student.status === 'DELINQUENT') {
      delinquentStudents.push({
        id: student.id,
        fullName: student.fullName,
        belt: student.belt,
        className: student.className,
        classId: student.classId,
        reason: 'delinquent',
      });
    }
  }

  eligibleStudents.sort((a, b) =>
    a.fullName.localeCompare(b.fullName, 'pt-BR'),
  );
  delinquentStudents.sort((a, b) =>
    a.fullName.localeCompare(b.fullName, 'pt-BR'),
  );

  return {
    stats: {
      classesCount: classes.length,
      studentsCount: students.length,
      eligibleStudentsCount: eligibleStudents.length,
      delinquentStudentsCount: delinquentStudents.length,
    },
    todayClasses,
    eligibleStudents,
    delinquentStudents,
  };
}
