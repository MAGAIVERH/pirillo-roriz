import { requireInstructorContext } from '@/lib/session-context';
import { InstructorStoreView } from '@/modules/instructor-portal/components/instructor-store-view';
import { getInstructorStoreReservations } from '@/modules/instructor-portal/queries/get-instructor-store-reservations';
import { getStoreCatalog } from '@/modules/store/queries/get-store-catalog';

export default async function ProfessorStorePage() {
  const { instructor } = await requireInstructorContext();

  const [products, reservations] = await Promise.all([
    getStoreCatalog('instructor'),
    getInstructorStoreReservations(instructor.id),
  ]);

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Loja
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-400">
          Veja os produtos disponíveis e reserve para retirada presencial na
          academia.
        </p>
      </section>

      <InstructorStoreView products={products} reservations={reservations} />
    </div>
  );
}
