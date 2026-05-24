'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  Clock3,
  Package,
  Search,
  ShoppingBag,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';

import { createStudentStoreReservationAction } from '@/modules/student-portal/actions/create-student-store-reservation';
import { InstructorStoreProductDetailModal } from '@/modules/instructor-portal/components/instructor-store-product-detail-modal';
import type { StudentStoreReservationItem } from '@/modules/student-portal/queries/get-student-store-reservations';
import { STORE_RESERVATION_EXPIRY_DAYS } from '@/modules/store/lib/store-constants';
import type { StoreCatalogItem } from '@/modules/store/queries/get-store-catalog';

type StudentStoreViewProps = {
  products: StoreCatalogItem[];
  reservations: StudentStoreReservationItem[];
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

type StoreProductCardProps = {
  product: StoreCatalogItem;
  onOpen: (product: StoreCatalogItem) => void;
};

const StoreProductCard = ({ product, onOpen }: StoreProductCardProps) => {
  const coverImage = product.imageUrls[0] ?? product.imageUrl;
  const photoCount = product.imageUrls.length;

  return (
    <button
      type="button"
      onClick={() => onOpen(product)}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 text-left transition hover:border-red-500/30 hover:bg-zinc-900/80"
    >
      <div className="relative flex h-44 items-center justify-center bg-zinc-900">
        {coverImage ? (
          <img
            src={coverImage}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-zinc-600" />
        )}

        <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[10px] font-medium text-zinc-300">
          {product.availableQuantity} disponível(is)
        </span>

        {photoCount > 1 ? (
          <span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-1 text-[10px] font-medium text-zinc-300">
            {photoCount} fotos
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-white">{product.name}</h3>
        <p className="mt-2 text-xl font-bold text-red-400">
          {formatBRL(product.priceCents)}
        </p>

        {product.description ? (
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-zinc-400">
            {product.description}
          </p>
        ) : (
          <p className="mt-3 flex-1 text-sm text-zinc-500">
            Retirada presencial na academia.
          </p>
        )}

        <span className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900 text-sm font-medium text-zinc-300">
          Ver fotos e reservar
        </span>
      </div>
    </button>
  );
};

const statusConfig = {
  pending: {
    label: 'Aguardando retirada',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  fulfilled: {
    label: 'Retirado',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  expired: {
    label: 'Expirado',
    className: 'border-zinc-500/30 bg-zinc-500/10 text-zinc-400',
  },
} as const;

export function StudentStoreView({
  products,
  reservations,
}: StudentStoreViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'catalog' | 'reservations'>(
    'catalog',
  );
  const [selectedProduct, setSelectedProduct] = useState<StoreCatalogItem | null>(
    null,
  );
  const [isPending, startTransition] = useTransition();
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.description?.toLowerCase().includes(normalizedSearch) ?? false)
      );
    });
  }, [products, search]);

  const pendingReservations = reservations.filter(
    (item) => item.status === 'pending',
  );

  const handleReserve = (productId: string) => {
    setPendingProductId(productId);

    startTransition(async () => {
      const result = await createStudentStoreReservationAction({
        productId,
        quantity: 1,
      });

      setPendingProductId(null);

      if (result.success) {
        toast.success(result.message);
        setSelectedProduct(null);
        setActiveTab('reservations');
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  };

  const productsGridClassName =
    filteredProducts.length === 1
      ? 'mx-auto grid w-full max-w-sm gap-4'
      : filteredProducts.length === 2
        ? 'grid gap-4 sm:grid-cols-2'
        : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <div className="min-w-0 space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Loja
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Produtos
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-400">
          Veja os produtos disponíveis, abra as fotos e reserve para retirada
          presencial na academia.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`inline-flex h-10 items-center rounded-xl border px-4 text-sm font-medium transition ${
              activeTab === 'catalog'
                ? 'border-red-500/40 bg-red-600/15 text-red-300'
                : 'border-white/10 bg-zinc-950 text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            Catálogo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reservations')}
            className={`inline-flex h-10 items-center rounded-xl border px-4 text-sm font-medium transition ${
              activeTab === 'reservations'
                ? 'border-red-500/40 bg-red-600/15 text-red-300'
                : 'border-white/10 bg-zinc-950 text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            Minhas reservas
            {pendingReservations.length > 0 ? (
              <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                {pendingReservations.length}
              </span>
            ) : null}
          </button>
        </div>

        {activeTab === 'catalog' ? (
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 text-zinc-400 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar produto..."
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
            />
          </div>
        ) : null}
      </div>

      {activeTab === 'catalog' ? (
        <>
          {filteredProducts.length > 0 ? (
            <section className={productsGridClassName}>
              {filteredProducts.map((product) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  onOpen={setSelectedProduct}
                />
              ))}
            </section>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 px-6 py-12 text-center">
              <Store className="mx-auto h-8 w-8 text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-400">
                {products.length === 0
                  ? 'Nenhum produto disponível no momento.'
                  : 'Nenhum produto encontrado para a busca informada.'}
              </p>
            </div>
          )}

          <p className="flex items-center gap-2 text-xs text-zinc-500">
            <Clock3 className="h-3.5 w-3.5" />
            Reservas expiram em {STORE_RESERVATION_EXPIRY_DAYS} dias se não forem
            retiradas na academia.
          </p>
        </>
      ) : (
        <section className="space-y-3">
          {reservations.length > 0 ? (
            reservations.map((reservation) => {
              const status = statusConfig[reservation.status];

              return (
                <article
                  key={`${reservation.id}-${reservation.productId}`}
                  className="rounded-2xl border border-white/10 bg-zinc-950 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-white">
                        {reservation.productName}
                      </p>
                      <p className="mt-1 text-sm text-zinc-400">
                        {reservation.quantity} un. ·{' '}
                        {formatBRL(reservation.totalCents)}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-zinc-500 sm:grid-cols-2">
                    <p>Reservado em: {formatDate(reservation.createdAt)}</p>
                    <p>
                      {reservation.status === 'pending'
                        ? `Retirar até: ${formatDate(reservation.expiresAt)}`
                        : `Validade: ${formatDate(reservation.expiresAt)}`}
                    </p>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 px-6 py-12 text-center">
              <ShoppingBag className="mx-auto h-8 w-8 text-zinc-600" />
              <p className="mt-3 text-sm text-zinc-400">
                Você ainda não fez nenhuma reserva.
              </p>
            </div>
          )}
        </section>
      )}

      <InstructorStoreProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onReserve={handleReserve}
        isPending={isPending}
        pendingProductId={pendingProductId}
      />
    </div>
  );
}
