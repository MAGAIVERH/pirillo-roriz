'use client';

// src/modules/store/components/store-reservations-table.tsx

import { BookmarkCheck, GraduationCap, UserRound } from 'lucide-react';
import type { StoreReservation } from '../types';

interface StoreReservationsTableProps {
  reservations: StoreReservation[];
  onConfirm: (id: string) => void;
}

export function StoreReservationsTable({
  reservations,
  onConfirm,
}: StoreReservationsTableProps) {
  if (reservations.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 py-16 text-zinc-500'>
        <BookmarkCheck className='h-9 w-9 opacity-40' />
        <span className='text-sm'>Nenhuma reserva ainda</span>
      </div>
    );
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-white/10'>
      {/* Cabeçalho */}
      <div className='grid grid-cols-5 gap-4 bg-zinc-900 px-5 py-3 text-xs font-medium uppercase tracking-wide text-zinc-500'>
        <span className='col-span-2'>Produto / Solicitante</span>
        <span>Tipo</span>
        <span>Status</span>
        <span>Ação</span>
      </div>

      {/* Linhas */}
      {reservations.map((r, i) => (
        <div
          key={r.id}
          className={`grid grid-cols-5 gap-4 items-center px-5 py-4 text-sm transition hover:bg-zinc-900/60 ${
            i !== 0 ? 'border-t border-white/10' : ''
          }`}
        >
          <div className='col-span-2'>
            <p className='font-medium text-white'>{r.productName}</p>
            <p className='text-xs text-zinc-500'>
              {r.userName} ·{' '}
              {new Date(r.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>

          <span>
            {r.userType === 'aluno' ? (
              <span className='flex w-fit items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400'>
                <GraduationCap className='h-3 w-3' /> Aluno
              </span>
            ) : (
              <span className='flex w-fit items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-xs font-medium text-purple-400'>
                <UserRound className='h-3 w-3' /> Professor
              </span>
            )}
          </span>

          <span>
            {r.status === 'pending' ? (
              <span className='rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs font-medium text-yellow-400'>
                Pendente
              </span>
            ) : (
              <span className='rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400'>
                Confirmada
              </span>
            )}
          </span>

          <span>
            {r.status === 'pending' ? (
              <button
                onClick={() => onConfirm(r.id)}
                className='rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-400 transition hover:border-green-500/30 hover:text-green-400'
              >
                Confirmar
              </button>
            ) : (
              <span className='text-zinc-600'>—</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );
}
