'use client';

// src/modules/store/components/store-client-view.tsx
// Client component responsável por toda a interatividade da página:
// tabs, busca, modal de produto, confirmação de reserva.

import { useState } from 'react';
import { Package, ShoppingBag } from 'lucide-react';
import type { StoreProduct, StoreReservation } from '../types';
import type { StoreProductInput } from '../schemas/store-product-schema';
import { StoreProductCard } from './store-product-card';
import { StoreProductModal } from './store-product-modal';
import { StoreReservationsTable } from './store-reservations-table';
import {
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  confirmStoreReservation,
} from '../actions/store-actions';

interface StoreClientViewProps {
  initialProducts: StoreProduct[];
  initialReservations: StoreReservation[];
}

export function StoreClientView({
  initialProducts,
  initialReservations,
}: StoreClientViewProps) {
  const [products, setProducts]         = useState(initialProducts);
  const [reservations, setReservations] = useState(initialReservations);
  const [activeTab, setActiveTab]       = useState<'produtos' | 'reservas'>('produtos');
  const [search, setSearch]             = useState('');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editing, setEditing]           = useState<StoreProduct | null>(null);

  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(product: StoreProduct) {
    setEditing(product);
    setModalOpen(true);
  }

  async function handleSave(data: StoreProductInput, id?: string) {
    if (id) {
      await updateStoreProduct(id, data);
      setProducts(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, ...data, updatedAt: new Date() }
            : p,
        ),
      );
    } else {
      await createStoreProduct(data);
      // optimistic update — o revalidatePath do server action vai sincronizar
      setProducts(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          reserved: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          description: data.description ?? null,
          imageUrl: data.imageUrl ?? null,
          ...data,
        },
      ]);
    }
    setModalOpen(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este produto da loja?')) return;
    await deleteStoreProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  async function handleConfirmReservation(reservationId: string) {
    await confirmStoreReservation(reservationId);
    setReservations(prev =>
      prev.map(r => r.id === reservationId ? { ...r, status: 'confirmed' as const } : r),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <section className='rounded-2xl border border-white/10 bg-zinc-950 p-6'>

        {/* Tab bar + botão novo produto */}
        <div className='mb-6 flex items-center justify-between border-b border-white/10 pb-0'>
          <div className='flex gap-1'>
            {(['produtos', 'reservas'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 -mb-px text-sm font-medium transition ${
                  activeTab === tab
                    ? 'border-red-500 text-white'
                    : 'border-transparent text-zinc-400 hover:text-white'
                }`}
              >
                {tab === 'produtos' ? 'Produtos' : 'Reservas'}
                {tab === 'reservas' && pendingCount > 0 && (
                  <span className='rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400'>
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={openNew}
            className='mb-1 flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500'
          >
            <Package className='h-4 w-4' />
            Novo produto
          </button>
        </div>

        {/* ── Tab: Produtos ── */}
        {activeTab === 'produtos' && (
          <div className='space-y-4'>
            <input
              type='text'
              placeholder='Buscar produto...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-full max-w-xs rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500/50'
            />

            {filtered.length === 0 ? (
              <div className='flex flex-col items-center gap-3 py-16 text-zinc-500'>
                <ShoppingBag className='h-10 w-10 opacity-40' />
                <span className='text-sm'>Nenhum produto encontrado</span>
              </div>
            ) : (
              <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
                {filtered.map(p => (
                  <StoreProductCard
                    key={p.id}
                    product={p}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Reservas ── */}
        {activeTab === 'reservas' && (
          <div className='space-y-4'>
            <p className='rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-300'>
              Reservas diminuem o estoque em tempo real. Alunos e professores
              não compram online — apenas reservam para retirada presencial.
            </p>
            <StoreReservationsTable
              reservations={reservations}
              onConfirm={handleConfirmReservation}
            />
          </div>
        )}
      </section>

      {/* Modal */}
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
