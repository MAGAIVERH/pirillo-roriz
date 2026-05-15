'use client';

// src/modules/store/components/store-product-modal.tsx

import { useRef, useState } from 'react';
import { Camera, GraduationCap, Tag, UserRound, X } from 'lucide-react';
import type { StoreProduct, StoreVisibility } from '../types';
import type { StoreProductInput } from '../schemas/store-product-schema';

interface StoreProductModalProps {
  product: StoreProduct | null; // null = novo produto
  onClose: () => void;
  onSave: (data: StoreProductInput, id?: string) => Promise<void>;
}

export function StoreProductModal({ product, onClose, onSave }: StoreProductModalProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const [name,     setName]     = useState(product?.name ?? '');
  const [price,    setPrice]    = useState(product ? (product.priceCents / 100).toFixed(2).replace('.', ',') : '');
  const [qty,      setQty]      = useState(product ? String(product.qty) : '');
  const [desc,     setDesc]     = useState(product?.description ?? '');
  const [vis,      setVis]      = useState<StoreVisibility>(product?.visibility ?? 'todos');
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? '');
  const [saving,   setSaving]   = useState(false);

  function handleImg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setImageUrl(ev.target?.result as string ?? '');
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    const priceCents = Math.round(parseFloat(price.replace(',', '.')) * 100);
    const qtyNum     = parseInt(qty);
    if (!name || isNaN(priceCents) || isNaN(qtyNum)) return;

    setSaving(true);
    await onSave(
      { name, priceCents, qty: qtyNum, description: desc, imageUrl, visibility: vis },
      product?.id,
    );
    setSaving(false);
  }

  const visOptions: { value: StoreVisibility; label: string; Icon: React.ElementType }[] = [
    { value: 'todos',       label: 'Todos',       Icon: Tag },
    { value: 'alunos',      label: 'Alunos',      Icon: GraduationCap },
    { value: 'professores', label: 'Professores', Icon: UserRound },
  ];

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='mb-5 flex items-center justify-between'>
          <h2 className='text-lg font-semibold text-white'>
            {product ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button
            onClick={onClose}
            className='rounded-lg p-1 text-zinc-500 transition hover:text-white'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='space-y-4'>
          {/* Upload de imagem */}
          <div>
            <label className='mb-1.5 block text-xs font-medium text-zinc-400'>
              Foto do produto
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className='relative flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/20 bg-zinc-900 transition hover:border-red-500/40'
            >
              {imageUrl ? (
                <img src={imageUrl} alt='' className='h-full w-full object-cover' />
              ) : (
                <div className='flex flex-col items-center gap-2 text-zinc-500'>
                  <Camera className='h-6 w-6' />
                  <span className='text-xs'>Clique para adicionar foto</span>
                </div>
              )}
              <input
                ref={fileRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImg}
              />
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className='mb-1.5 block text-xs font-medium text-zinc-400'>
              Nome do produto
            </label>
            <input
              type='text'
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder='Ex: Camiseta da academia'
              className='w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50'
            />
          </div>

          {/* Valor + Quantidade */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='mb-1.5 block text-xs font-medium text-zinc-400'>
                Valor (R$)
              </label>
              <input
                type='text'
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder='0,00'
                className='w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50'
              />
            </div>
            <div>
              <label className='mb-1.5 block text-xs font-medium text-zinc-400'>
                Estoque
              </label>
              <input
                type='number'
                value={qty}
                onChange={e => setQty(e.target.value)}
                placeholder='0'
                min={0}
                className='w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50'
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className='mb-1.5 block text-xs font-medium text-zinc-400'>
              Descrição{' '}
              <span className='text-zinc-600'>(opcional)</span>
            </label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              placeholder='Detalhes do produto...'
              className='w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50'
            />
          </div>

          {/* Visibilidade */}
          <div>
            <label className='mb-2 block text-xs font-medium text-zinc-400'>
              Visível para
            </label>
            <div className='flex gap-2'>
              {visOptions.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type='button'
                  onClick={() => setVis(value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    vis === value
                      ? 'border-red-500/50 bg-red-500/10 text-red-400'
                      : 'border-white/10 text-zinc-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Icon className='h-3 w-3' />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='mt-6 flex gap-3'>
          <button
            onClick={onClose}
            className='flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-400 transition hover:border-white/20 hover:text-white'
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className='flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50'
          >
            {saving ? 'Salvando...' : 'Salvar produto'}
          </button>
        </div>
      </div>
    </div>
  );
}
