import { requireInstructorContext } from '@/lib/session-context';
import { getInstructorQrCheckInSessions } from '@/modules/attendance/queries/get-instructor-qr-check-in-sessions';
import { InstructorQrScannerView } from '@/modules/instructor-portal/components/instructor-qr-scanner-view';

export default async function ProfessorQrCodePage() {
  const { instructor } = await requireInstructorContext();
  const sessions = await getInstructorQrCheckInSessions(instructor.id);

  return <InstructorQrScannerView sessions={sessions} />;
}
