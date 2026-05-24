import { requireStudentContext } from '@/lib/session-context';
import { getStudentAttendancePortalOverview } from '@/modules/attendance/queries/get-student-attendance-portal';
import { StudentAttendancePortalView } from '@/modules/student-portal/components/student-attendance-portal-view';

export default async function AlunoPortalPage() {
  const { student } = await requireStudentContext();
  const overview = await getStudentAttendancePortalOverview(student.id);
  const displayName = student.preferredName?.trim() || student.fullName;

  return (
    <StudentAttendancePortalView
      studentName={displayName}
      overview={overview}
    />
  );
}
