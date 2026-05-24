import { requireStudentContext } from '@/lib/session-context';
import { StudentStoreView } from '@/modules/student-portal/components/student-store-view';
import { getStudentStoreReservations } from '@/modules/student-portal/queries/get-student-store-reservations';
import { ensureStoreReservationsReleased } from '@/modules/store/lib/ensure-store-reservations-released';
import { getStoreCatalog } from '@/modules/store/queries/get-store-catalog';

export default async function AlunoLojaPage() {
  const { student } = await requireStudentContext();

  await ensureStoreReservationsReleased();

  const [products, reservations] = await Promise.all([
    getStoreCatalog('student'),
    getStudentStoreReservations(student.id),
  ]);

  return <StudentStoreView products={products} reservations={reservations} />;
}
