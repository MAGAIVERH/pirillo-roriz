import { notFound } from 'next/navigation';

import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import type { StudentListStatus } from '@/modules/students/types/student-list-item';

const weekDayMap: Record<string, string> = {
  SUNDAY: 'Domingo',
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
};

export type InstructorClassStudentItem = {
  id: string;
  fullName: string;
  belt: string;
  status: StudentListStatus;
  statusLabel: string;
  isDelinquent: boolean;
  progressStatus: string | null;
  attendancesSincePromotion: number;
};

export async function getInstructorClassDetail(
  instructorId: string,
  classId: string,
) {
  const academy = await getOrCreateDefaultAcademy();

  const foundClass = await db.class.findFirst({
    where: {
      id: classId,
      academyId: academy.id,
      instructorId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      capacity: true,
      active: true,
      classType: {
        select: {
          name: true,
        },
      },
      schedules: {
        orderBy: [{ weekDay: 'asc' }, { startTime: 'asc' }],
        select: {
          id: true,
          weekDay: true,
          startTime: true,
          endTime: true,
        },
      },
      enrollments: {
        where: {
          status: 'ACTIVE',
        },
        select: {
          student: {
            select: {
              id: true,
              fullName: true,
              status: true,
              beltStatus: {
                select: {
                  currentBelt: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
              progress: {
                select: {
                  status: true,
                  attendancesSincePromotion: true,
                },
              },
            },
          },
        },
        orderBy: {
          student: {
            fullName: 'asc',
          },
        },
      },
    },
  });

  if (!foundClass) {
    notFound();
  }

  const statusLabelMap: Record<string, string> = {
    LEAD: 'Interessado',
    TRIAL: 'Experimental',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    FROZEN: 'Trancado',
    CANCELED: 'Cancelado',
    DELINQUENT: 'Inadimplente',
  };

  const students: InstructorClassStudentItem[] = foundClass.enrollments.map(
    (enrollment) => ({
      id: enrollment.student.id,
      fullName: enrollment.student.fullName,
      belt: enrollment.student.beltStatus?.currentBelt?.name ?? 'Sem faixa',
      status: enrollment.student.status,
      statusLabel: statusLabelMap[enrollment.student.status] ?? enrollment.student.status,
      isDelinquent: enrollment.student.status === 'DELINQUENT',
      progressStatus: enrollment.student.progress?.status ?? null,
      attendancesSincePromotion:
        enrollment.student.progress?.attendancesSincePromotion ?? 0,
    }),
  );

  return {
    id: foundClass.id,
    name: foundClass.name,
    description: foundClass.description ?? '-',
    type: foundClass.classType.name,
    capacity: foundClass.capacity,
    capacityLabel: foundClass.capacity
      ? `${foundClass.capacity} vagas`
      : 'Não definida',
    active: foundClass.active,
    enrollmentsCount: students.length,
    schedules: foundClass.schedules.map((schedule) => ({
      id: schedule.id,
      weekDayLabel: weekDayMap[schedule.weekDay],
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })),
    students,
  };
}
