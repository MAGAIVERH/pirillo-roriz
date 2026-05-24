import { Archive, AlertTriangle, BookmarkCheck, ShoppingBag } from 'lucide-react';

import { StoreClientView } from '@/modules/store/components/store-client-view';
import { ensureStoreReservationsReleased } from '@/modules/store/lib/ensure-store-reservations-released';
import { getStoreOverviewStats } from '@/modules/store/queries/get-store-overview-stats';
import { getStoreProducts } from '@/modules/store/queries/get-store-products';
import { getStoreReservations } from '@/modules/store/queries/get-store-reservations';
import { STORE_RESERVATION_EXPIRY_DAYS } from '@/modules/store/lib/store-constants';

export default async function AdminLojaPage() {
  await ensureStoreReservationsReleased();

  const [products, reservations, stats] = await Promise.all([
    getStoreProducts(),
    getStoreReservations(),
    getStoreOverviewStats(),
  ]);

  const metricCards = [
    {
      title: 'Produtos na loja',
      value: String(stats.totalProducts),
      desc: 'Itens ativos cadastrados.',
      icon: ShoppingBag,
      alert: false,
    },
    {
      title: 'Itens em estoque',
      value: String(stats.totalStock),
      desc: 'Unidades disponíveis para reserva.',
      icon: Archive,
      alert: false,
    },
    {
      title: 'Reservas pendentes',
      value: String(stats.pendingReservations),
      desc: 'Aguardando retirada presencial.',
      icon: BookmarkCheck,
      alert: stats.pendingReservations > 0,
    },
    {
      title: 'Sem estoque',
      value: String(stats.outOfStock),
      desc: 'Produtos esgotados.',
      icon: AlertTriangle,
      alert: stats.outOfStock > 0,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
            Módulo
          </p>
          <h1 className="text-3xl font-bold tracking-tight">Loja</h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400">
            Gerencie produtos, estoque e reservas. Alunos e professores apenas
            reservam para retirada na academia — sem compra online. Reservas
            expiram em {STORE_RESERVATION_EXPIRY_DAYS} dias se não forem
            marcadas como vendidas.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ title, value, desc, icon: Icon, alert }) => (
          <div
            key={title}
            className={`rounded-2xl border p-5 ${
              alert
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-white/10 bg-zinc-950'
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-zinc-400">{title}</p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  alert
                    ? 'bg-red-600/20 text-red-400'
                    : 'bg-red-600/15 text-red-500'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p
              className={`mt-3 text-3xl font-bold ${alert ? 'text-red-400' : 'text-white'}`}
            >
              {value}
            </p>
            <p className="mt-2 text-sm text-zinc-400">{desc}</p>
          </div>
        ))}
      </section>

      <StoreClientView
        initialProducts={products}
        initialReservations={reservations}
      />
    </div>
  );
}

