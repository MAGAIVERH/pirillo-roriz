import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';
import type { StudentListStatus } from '@/modules/students/types/student-list-item';

export type InstructorStudentListItem = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  belt: string;
  className: string;
  classId: string;
  age: number | null;
  status: StudentListStatus;
  progressStatus: string | null;
  attendancesSincePromotion: number;
  isEligibleForPromotion: boolean;
};

const calculateAge = (birthDate: Date | null) => {
  if (!birthDate) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
};

const formatPhone = (value: string | null) => {
  if (!value) {
    return '-';
  }

  const digits = value.replace(/\D/g, '');

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  return value;
};

export async function getInstructorStudents(
  instructorId: string,
): Promise<InstructorStudentListItem[]> {
  const academy = await getOrCreateDefaultAcademy();

  const enrollments = await db.enrollment.findMany({
    where: {
      status: 'ACTIVE',
      class: {
        academyId: academy.id,
        instructorId,
      },
    },
    select: {
      classId: true,
      class: {
        select: {
          name: true,
        },
      },
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          birthDate: true,
          status: true,
          beltStatus: {
            select: {
              currentBelt: {
                select: {
                  name: true,
                  juvenileCategory: true,
                },
              },
            },
          },
          progress: {
            select: {
              status: true,
              attendancesSincePromotion: true,
              program: true,
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
  });

  const studentMap = new Map<string, InstructorStudentListItem>();

  for (const enrollment of enrollments) {
    const student = enrollment.student;

    if (studentMap.has(student.id)) {
      continue;
    }

    const isEligibleForPromotion =
      student.status === 'ACTIVE' && student.progress?.status === 'ELIGIBLE';

    studentMap.set(student.id, {
      id: student.id,
      fullName: student.fullName,
      email: student.email ?? '-',
      phone: formatPhone(student.phone),
      belt: student.beltStatus?.currentBelt?.name ?? 'Sem faixa',
      className: enrollment.class.name,
      classId: enrollment.classId,
      age: calculateAge(student.birthDate),
      status: student.status,
      progressStatus: student.progress?.status ?? null,
      attendancesSincePromotion:
        student.progress?.attendancesSincePromotion ?? 0,
      isEligibleForPromotion,
    });
  }

  return [...studentMap.values()].sort((a, b) =>
    a.fullName.localeCompare(b.fullName, 'pt-BR'),
  );
}

export type InstructorStudentFilter = 'todos' | 'aptos' | 'inadimplentes';

export function filterInstructorStudents(
  students: InstructorStudentListItem[],
  filter: InstructorStudentFilter,
): InstructorStudentListItem[] {
  if (filter === 'aptos') {
    return students.filter((student) => student.isEligibleForPromotion);
  }

  if (filter === 'inadimplentes') {
    return students.filter((student) => student.status === 'DELINQUENT');
  }

  return students;
}
