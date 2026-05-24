import { requireStudentContext } from '@/lib/session-context';
import { StudentStoreView } from '@/modules/student-portal/components/student-store-view';
import { getStudentStoreReservations } from '@/modules/student-portal/queries/get-student-store-reservations';
import { getStoreCatalog } from '@/modules/store/queries/get-store-catalog';

export default async function AlunoLojaPage() {
  const { student } = await requireStudentContext();

  const [products, reservations] = await Promise.all([
    getStoreCatalog('student'),
    getStudentStoreReservations(student.id),
  ]);

  return <StudentStoreView products={products} reservations={reservations} />;
}
