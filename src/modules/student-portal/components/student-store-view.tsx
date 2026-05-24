'use client';

import { useMemo, useState } from 'react';
import { Package, Search, Store } from 'lucide-react';

import { InstructorStoreProductDetailModal } from '@/modules/instructor-portal/components/instructor-store-product-detail-modal';
import type { StoreCatalogItem } from '@/modules/store/queries/get-store-catalog';

type StudentStoreViewProps = {
  products: StoreCatalogItem[];
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function StudentStoreView({ products }: StudentStoreViewProps) {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<StoreCatalogItem | null>(
    null,
  );

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

  const productsGridClassName =
    filteredProducts.length === 1
      ? 'mx-auto grid w-full max-w-sm gap-4'
      : filteredProducts.length === 2
        ? 'grid gap-4 sm:grid-cols-2'
        : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Loja
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Produtos
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-400">
          Veja os produtos disponíveis na academia. Toque em um item para ver
          fotos e detalhes.
        </p>

        <div className="mt-5 flex h-11 max-w-md items-center gap-2 rounded-xl border border-white/10 bg-zinc-900 px-3 text-zinc-400">
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar produto..."
            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </div>
      </section>

      {filteredProducts.length > 0 ? (
        <section className={productsGridClassName}>
          {filteredProducts.map((product) => {
            const coverImage = product.imageUrls[0] ?? product.imageUrl;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => setSelectedProduct(product)}
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
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold text-white">
                    {product.name}
                  </h3>
                  <p className="mt-2 text-xl font-bold text-red-400">
                    {formatBRL(product.priceCents)}
                  </p>
                  {product.description ? (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                      {product.description}
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
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

      <InstructorStoreProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onReserve={() => undefined}
        isPending={false}
        pendingProductId={null}
        allowReserve={false}
      />
    </div>
  );
}
