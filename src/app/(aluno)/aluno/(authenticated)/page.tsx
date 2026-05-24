import { requireStudentContext } from '@/lib/session-context';
import { buildStudentQrPayload } from '@/modules/attendance/lib/qr-token';
import { StudentQrHomeView } from '@/modules/student-portal/components/student-qr-home-view';

export default async function AlunoPortalPage() {
  const { student, academyId } = await requireStudentContext();
  const displayName = student.preferredName?.trim() || student.fullName;

  return (
    <StudentQrHomeView
      studentName={displayName}
      qrPayload={buildStudentQrPayload(student.id, academyId)}
    />
  );
}
