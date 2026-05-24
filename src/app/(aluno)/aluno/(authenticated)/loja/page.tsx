import { requireStudentContext } from '@/lib/session-context';
import { StudentStoreView } from '@/modules/student-portal/components/student-store-view';
import { getStoreCatalog } from '@/modules/store/queries/get-store-catalog';

export default async function AlunoLojaPage() {
  await requireStudentContext();
  const products = await getStoreCatalog('student');

  return <StudentStoreView products={products} />;
}
