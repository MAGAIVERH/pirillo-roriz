'use client';

import { useRef, useState, useTransition } from 'react';
import { Camera, GraduationCap, Tag, UserRound, X } from 'lucide-react';

import type { StoreProduct, StoreVisibility } from '../types/store';
import type { StoreProductInput } from '../schemas/store-product-schema';

const MAX_PRODUCT_IMAGES = 10;

type StoreProductModalProps = {
  product: StoreProduct | null;
  onClose: () => void;
  onSave: (data: StoreProductInput, id?: string) => Promise<{ success: boolean; message: string }>;
};

export function StoreProductModal({
  product,
  onClose,
  onSave,
}: StoreProductModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(
    product ? (product.priceCents / 100).toFixed(2).replace('.', ',') : '',
  );
  const [stockQuantity, setStockQuantity] = useState(
    product ? String(product.stockQuantity) : '',
  );
  const [description, setDescription] = useState(product?.description ?? '');
  const [visibility, setVisibility] = useState<StoreVisibility>(
    product?.visibility ?? 'todos',
  );
  const [imageUrls, setImageUrls] = useState<string[]>(() => {
    if (product?.imageUrls.length) {
      return product.imageUrls;
    }

    return product?.imageUrl ? [product.imageUrl] : [];
  });

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const remainingSlots = MAX_PRODUCT_IMAGES - imageUrls.length;
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    for (const file of selectedFiles) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const nextUrl = loadEvent.target?.result;

        if (typeof nextUrl !== 'string' || !nextUrl) {
          return;
        }

        setImageUrls((current) => {
          if (current.length >= MAX_PRODUCT_IMAGES) {
            return current;
          }

          return [...current, nextUrl];
        });
      };
      reader.readAsDataURL(file);
    }

    event.target.value = '';
  }

  function handleRemoveImage(index: number) {
    setImageUrls((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function handleSave() {
    const priceCents = Math.round(
      Number.parseFloat(price.replace(',', '.')) * 100,
    );
    const stockValue = Number.parseInt(stockQuantity, 10);

    if (!name.trim() || Number.isNaN(priceCents) || Number.isNaN(stockValue)) {
      return;
    }

    startTransition(async () => {
      await onSave(
        {
          name: name.trim(),
          priceCents,
          stockQuantity: stockValue,
          description: description.trim() || undefined,
          imageUrls,
          visibility,
        },
        product?.id,
      );
    });
  }

  const visibilityOptions: {
    value: StoreVisibility;
    label: string;
    Icon: React.ElementType;
  }[] = [
    { value: 'todos', label: 'Todos', Icon: Tag },
    { value: 'alunos', label: 'Alunos', Icon: GraduationCap },
    { value: 'professores', label: 'Professores', Icon: UserRound },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {product ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-500 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-medium text-zinc-400">
                Fotos do produto
              </label>
              <span className="text-[10px] text-zinc-500">
                {imageUrls.length}/{MAX_PRODUCT_IMAGES}
              </span>
            </div>

            {imageUrls.length > 0 ? (
              <div className="mb-3 grid grid-cols-3 gap-2">
                {imageUrls.map((url, index) => (
                  <div
                    key={`${url.slice(0, 24)}-${index}`}
                    className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-zinc-900"
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-1 top-1 rounded-md bg-black/70 p-1 text-zinc-300 transition hover:text-white"
                      aria-label={`Remover foto ${index + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {index === 0 ? (
                      <span className="absolute bottom-1 left-1 rounded-md bg-red-600/90 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                        Capa
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              disabled={imageUrls.length >= MAX_PRODUCT_IMAGES}
              onClick={() => fileRef.current?.click()}
              className="relative flex h-24 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-zinc-900 transition hover:border-red-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <Camera className="h-6 w-6" />
                <span className="text-xs">
                  {imageUrls.length === 0
                    ? 'Clique para adicionar fotos'
                    : 'Adicionar mais fotos'}
                </span>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageChange}
              />
            </button>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Nome do produto
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Ex: Camiseta da academia"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Valor (R$)
              </label>
              <input
                type="text"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="0,00"
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Estoque
              </label>
              <input
                type="number"
                value={stockQuantity}
                onChange={(event) => setStockQuantity(event.target.value)}
                placeholder="0"
                min={0}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Descrição <span className="text-zinc-600">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              placeholder="Detalhes do produto..."
              className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Visível para
            </label>
            <div className="flex gap-2">
              {visibilityOptions.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVisibility(value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    visibility === value
                      ? 'border-red-500/50 bg-red-500/10 text-red-400'
                      : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
          >
            {isPending ? 'Salvando...' : 'Salvar produto'}
          </button>
        </div>
      </div>
    </div>
  );
}
