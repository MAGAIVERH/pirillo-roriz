import { requireStudentContext } from '@/lib/session-context';
import { StudentPresenceView } from '@/modules/student-portal/components/student-presence-view';
import { getStudentPresencePage } from '@/modules/student-portal/queries/get-student-presence-page';

export default async function AlunoPresencaPage() {
  const { student } = await requireStudentContext();
  const data = await getStudentPresencePage(student.id);

  return <StudentPresenceView data={data} />;
}
