import { requireStudentContext } from '@/lib/session-context';
import { StudentWarningsView } from '@/modules/student-portal/components/student-warnings-view';
import { getStudentWarningsPage } from '@/modules/student-portal/queries/get-student-warnings-page';

export default async function AlunoAvisosPage() {
  const { user, student } = await requireStudentContext();
  const warnings = await getStudentWarningsPage(student.id, user.id);

  return <StudentWarningsView warnings={warnings} />;
}
