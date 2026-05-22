'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Package, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

import { createStoreProductAction } from '../actions/create-store-product';
import { deleteStoreProductAction } from '../actions/delete-store-product';
import { markStoreReservationSoldAction } from '../actions/mark-store-reservation-sold';
import { updateStoreProductAction } from '../actions/update-store-product';
import { STORE_RESERVATION_EXPIRY_DAYS } from '../lib/store-constants';
import type { StoreProductInput } from '../schemas/store-product-schema';
import type { StoreProduct, StoreReservation } from '../types/store';
import { StoreProductCard } from './store-product-card';
import { StoreProductModal } from './store-product-modal';
import { StoreReservationsTable } from './store-reservations-table';

type StoreClientViewProps = {
  initialProducts: StoreProduct[];
  initialReservations: StoreReservation[];
};

export function StoreClientView({
  initialProducts,
  initialReservations,
}: StoreClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [activeTab, setActiveTab] = useState<'produtos' | 'reservas'>('produtos');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StoreProduct | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const activeProducts = useMemo(
    () => initialProducts.filter((product) => product.active),
    [initialProducts],
  );

  const pendingCount = useMemo(
    () =>
      initialReservations.filter((reservation) => reservation.status === 'pending')
        .length,
    [initialReservations],
  );

  const filteredProducts = useMemo(
    () =>
      activeProducts.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [activeProducts, search],
  );

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: StoreProduct) {
    setEditing(product);
    setModalOpen(true);
  }

  function refreshAfterMutation(message: string) {
    toast.success(message);
    setModalOpen(false);
    setDeleteTargetId(null);
    setTimeout(() => {
      router.refresh();
    }, 400);
  }

  async function handleSave(data: StoreProductInput, id?: string) {
    const result = id
      ? await updateStoreProductAction(id, data)
      : await createStoreProductAction(data);

    if (!result.success) {
      toast.error(result.message);
      return { success: false, message: result.message };
    }

    refreshAfterMutation(result.message);
    return result;
  }

  function handleDelete(id: string) {
    setDeleteTargetId(id);
  }

  function confirmDelete() {
    if (!deleteTargetId) return;

    startTransition(async () => {
      const result = await deleteStoreProductAction(deleteTargetId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      refreshAfterMutation(result.message);
    });
  }

  function handleMarkSold(orderId: string) {
    startTransition(async () => {
      const result = await markStoreReservationSoldAction(orderId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      refreshAfterMutation(result.message);
    });
  }

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
        <div className="mb-6 border-b border-white/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full gap-1 sm:w-auto">
              {(['produtos', 'reservas'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`-mb-px flex flex-1 items-center justify-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition sm:flex-initial sm:justify-start sm:px-4 ${
                    activeTab === tab
                      ? 'border-red-500 text-white'
                      : 'border-transparent text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab === 'produtos' ? 'Produtos' : 'Reservas'}
                  {tab === 'reservas' && pendingCount > 0 && (
                    <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'produtos' ? (
              <button
                type="button"
                onClick={openNew}
                className="mb-3 flex w-full shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 sm:mb-1 sm:w-auto sm:justify-start"
              >
                <Package className="h-4 w-4 shrink-0" />
                Novo produto
              </button>
            ) : null}
          </div>
        </div>

        {activeTab === 'produtos' && (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500/50 sm:max-w-xs"
            />

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-16 text-zinc-500">
                <ShoppingBag className="h-10 w-10 opacity-40" />
                <span className="text-sm">Nenhum produto encontrado</span>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <StoreProductCard
                    key={product.id}
                    product={product}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reservas' && (
          <div className="space-y-4">
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
              Alunos e professores não compram online — apenas reservam para
              retirada presencial. Reservas expiram em{' '}
              {STORE_RESERVATION_EXPIRY_DAYS} dias se não forem marcadas como
              vendidas.
            </p>
            <StoreReservationsTable
              reservations={initialReservations}
              onMarkSold={handleMarkSold}
              isPending={isPending}
            />
          </div>
        )}
      </section>

      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold text-white">Remover produto?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              O produto será desativado na loja. Reservas pendentes impedem a
              remoção.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <StoreProductModal
          product={editing}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

