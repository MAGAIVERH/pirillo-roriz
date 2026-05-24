'use client';

import { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  ShoppingBag,
  X,
} from 'lucide-react';

import type { StoreCatalogItem } from '@/modules/store/queries/get-store-catalog';

type InstructorStoreProductDetailModalProps = {
  product: StoreCatalogItem | null;
  onClose: () => void;
  onReserve: (productId: string) => void;
  isPending: boolean;
  pendingProductId: string | null;
  allowReserve?: boolean;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function InstructorStoreProductDetailModal({
  product,
  onClose,
  onReserve,
  isPending,
  pendingProductId,
  allowReserve = true,
}: InstructorStoreProductDetailModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

  if (!product) {
    return null;
  }

  const images =
    product.imageUrls.length > 0
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : [];

  const hasMultipleImages = images.length > 1;
  const currentImage = images[activeIndex] ?? null;
  const isReserving = isPending && pendingProductId === product.id;

  const goToPrevious = () => {
    setActiveIndex((current) =>
      current === 0 ? images.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    setActiveIndex((current) =>
      current === images.length - 1 ? 0 : current + 1,
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes de ${product.name}`}
      >
        <div className="relative flex min-h-[280px] items-center justify-center bg-zinc-900 sm:min-h-[360px]">
          {currentImage ? (
            <img
              src={currentImage}
              alt={`${product.name} — foto ${activeIndex + 1}`}
              className="max-h-[50vh] w-full object-contain sm:max-h-[420px]"
            />
          ) : (
            <Package className="h-20 w-20 text-zinc-600" />
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-xl border border-white/10 bg-black/60 p-2 text-zinc-300 transition hover:text-white"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={goToPrevious}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-black/60 p-2 text-white transition hover:bg-black/80"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-black/60 p-2 text-white transition hover:bg-black/80"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                {images.map((image, index) => (
                  <button
                    key={`${product.id}-dot-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition ${
                      index === activeIndex
                        ? 'w-6 bg-red-500'
                        : 'w-2 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Ver foto ${index + 1}`}
                  />
                ))}
              </div>

              <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[10px] font-medium text-zinc-300">
                {activeIndex + 1} / {images.length}
              </span>
            </>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white">{product.name}</h2>
              <p className="mt-1 text-2xl font-bold text-red-400">
                {formatBRL(product.priceCents)}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs font-medium text-zinc-300">
              {product.availableQuantity} disponível(is)
            </span>
          </div>

          {product.description ? (
            <p className="mt-4 text-sm leading-7 text-zinc-400">
              {product.description}
            </p>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">
              Retirada presencial na academia.
            </p>
          )}

          {hasMultipleImages ? (
            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${product.id}-thumb-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition ${
                    index === activeIndex
                      ? 'border-red-500/60 ring-2 ring-red-500/30'
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  <img
                    src={image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}

          {allowReserve ? (
            <button
              type="button"
              disabled={isPending}
              onClick={() => onReserve(product.id)}
              className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              {isReserving ? 'Reservando...' : 'Reservar produto'}
            </button>
          ) : (
            <p className="mt-6 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-400">
              Retirada presencial na academia. Fale com a recepção para reservar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
