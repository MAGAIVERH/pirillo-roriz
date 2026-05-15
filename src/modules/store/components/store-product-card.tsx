'use client';

// src/modules/store/components/store-product-card.tsx

import { GraduationCap, Package, Pencil, Tag, Trash2, UserRound } from 'lucide-react';
import type { StoreProduct } from '../types';

interface StoreProductCardProps {
  product: StoreProduct;
  onEdit: (product: StoreProduct) => void;
  onDelete: (id: string) => void;
}

function fmtBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function StockBadge({ product }: { product: StoreProduct }) {
  const avail = product.qty - product.reserved;
  if (avail <= 0)
    return (
      <span className='rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-medium text-red-400'>
        Esgotado
      </span>
    );
  if (avail <= 3)
    return (
      <span className='rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-400'>
        {avail} restantes
      </span>
    );
  return (
    <span className='rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400'>
      {avail} disponíveis
    </span>
  );
}

export function StoreProductCard({ product, onEdit, onDelete }: StoreProductCardProps) {
  return (
    <div className='overflow-hidden rounded-2xl border border-white/10 bg-zinc-900'>
      {/* Imagem */}
      <div className='relative flex h-36 items-center justify-center bg-zinc-800'>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className='h-full w-full object-cover'
          />
        ) : (
          <Package className='h-10 w-10 text-zinc-600' />
        )}

        {/* Badge de visibilidade */}
        <span className='absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-zinc-300'>
          {product.visibility === 'alunos'      && <GraduationCap className='h-3 w-3' />}
          {product.visibility === 'professores' && <UserRound className='h-3 w-3' />}
          {product.visibility === 'todos'       && <Tag className='h-3 w-3' />}
          {product.visibility}
        </span>
      </div>

      {/* Info */}
      <div className='p-4'>
        <p className='truncate text-sm font-semibold text-white'>{product.name}</p>
        <p className='mt-1 text-base font-bold text-white'>{fmtBRL(product.priceCents)}</p>
        <div className='mt-2 flex items-center justify-between'>
          <StockBadge product={product} />
          {product.reserved > 0 && (
            <span className='text-xs text-zinc-500'>{product.reserved} reserv.</span>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className='flex gap-2 border-t border-white/10 px-4 py-3'>
        <button
          onClick={() => onEdit(product)}
          className='flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-1.5 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white'
        >
          <Pencil className='h-3 w-3' /> Editar
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className='flex items-center justify-center rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-500 transition hover:border-red-500/30 hover:text-red-400'
          aria-label='Excluir produto'
        >
          <Trash2 className='h-3 w-3' />
        </button>
      </div>
    </div>
  );
}
