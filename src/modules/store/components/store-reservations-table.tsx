'use client';

import { BookmarkCheck, GraduationCap, UserRound } from 'lucide-react';

import { STORE_RESERVATION_EXPIRY_DAYS } from '../lib/store-constants';
import type { StoreReservation } from '../types/store';

type StoreReservationsTableProps = {
  reservations: StoreReservation[];
  onMarkSold: (id: string) => void;
  isPending: boolean;
};

export function StoreReservationsTable({
  reservations,
  onMarkSold,
  isPending,
}: StoreReservationsTableProps) {
  if (reservations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-zinc-500">
        <BookmarkCheck className="h-9 w-9 opacity-40" />
        <span className="text-sm">Nenhuma reserva ainda</span>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10">
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 border-b border-white/10 bg-zinc-900 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
        <span>Produto / Solicitante</span>
        <span>Tipo</span>
        <span>Status</span>
        <span>Ação</span>
      </div>

      <div className="divide-y divide-white/10">
        {reservations.map((reservation) => (
          <div
            key={`${reservation.id}-${reservation.productId}`}
            className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm transition hover:bg-zinc-900/60"
          >
            <div>
              <p className="font-medium text-white">{reservation.productName}</p>
              <p className="text-xs text-zinc-500">
                {reservation.userName} ·{' '}
                {new Date(reservation.createdAt).toLocaleDateString('pt-BR')}
                {reservation.quantity > 1
                  ? ` · ${reservation.quantity} un.`
                  : ''}
              </p>
              {reservation.status === 'pending' && (
                <p className="mt-1 text-xs text-amber-400">
                  Retirada até{' '}
                  {reservation.expiresAt.toLocaleDateString('pt-BR')} (
                  {STORE_RESERVATION_EXPIRY_DAYS} dias)
                </p>
              )}
            </div>

            <span>
              {reservation.userType === 'aluno' ? (
                <span className="flex w-fit items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                  <GraduationCap className="h-3 w-3" /> Aluno
                </span>
              ) : (
                <span className="flex w-fit items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-300">
                  <UserRound className="h-3 w-3" /> Professor
                </span>
              )}
            </span>

            <span>
              {reservation.status === 'pending' ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                  Aguardando retirada
                </span>
              ) : (
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-medium text-emerald-400">
                  Vendido
                </span>
              )}
            </span>

            <span>
              {reservation.status === 'pending' ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => onMarkSold(reservation.id)}
                  className="rounded-lg border border-white/10 px-3 py-1 text-xs text-zinc-400 transition hover:border-emerald-500/30 hover:text-emerald-400 disabled:opacity-50"
                >
                  Marcar vendido
                </button>
              ) : (
                <span className="text-zinc-600">—</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
