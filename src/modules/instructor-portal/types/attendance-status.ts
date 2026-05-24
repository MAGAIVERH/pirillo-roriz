export type InstructorAttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'EXCUSED';

export const INSTRUCTOR_ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  EXCUSED: 'EXCUSED',
} as const satisfies Record<
  InstructorAttendanceStatus,
  InstructorAttendanceStatus
>;

export const instructorAttendanceStatusLabelMap: Record<
  InstructorAttendanceStatus,
  string
> = {
  PRESENT: 'Presente',
  ABSENT: 'Falta',
  LATE: 'Atrasado',
  EXCUSED: 'Justificado',
};

export function isPresentAttendanceStatus(
  status: InstructorAttendanceStatus | null | undefined,
): boolean {
  return status === 'PRESENT' || status === 'LATE';
}
