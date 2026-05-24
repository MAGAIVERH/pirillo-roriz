'use client';

import {
  AlertTriangle,
  Building2,
  GraduationCap,
  Info,
  Megaphone,
  Trash2,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import type { InstructorWarningListItem } from '@/modules/instructor-portal/types/instructor-warnings';
import type { WarningType } from '@/modules/warnings/types/warnings';

type WarningCatalogCardProps = {
  warning: InstructorWarningListItem;
  featured?: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
};

const typeConfig: Record<
  WarningType,
  { label: string; className: string; Icon: LucideIcon }
> = {
  info: {
    label: 'Informativo',
    className: 'bg-zinc-800 text-zinc-300',
    Icon: Info,
  },
  aviso: {
    label: 'Atenção',
    className: 'bg-amber-500/15 text-amber-400',
    Icon: AlertTriangle,
  },
  importante: {
    label: 'Importante',
    className: 'bg-red-500/15 text-red-400',
    Icon: Megaphone,
  },
};

function formatDate(date: Date | null) {
  if (!date) {
    return '—';
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function WarningCatalogCard({
  warning,
  featured = false,
  onDelete,
  isDeleting = false,
}: WarningCatalogCardProps) {
  const type = typeConfig[warning.type];
  const TypeIcon = type.Icon;
  const SourceIcon =
    warning.source === 'academy' ? Building2 : GraduationCap;

  const isFeaturedAcademy = featured && warning.source === 'academy';

  return (
    <article
      className={`flex h-full flex-col rounded-2xl border ${
        isFeaturedAcademy
          ? 'border-red-500/30 bg-red-500/5 shadow-[0_0_0_1px_rgba(239,68,68,0.08)]'
          : 'border-white/10 bg-zinc-950'
      }`}
    >
      <header
        className={`border-b p-5 ${
          isFeaturedAcademy ? 'border-red-500/20' : 'border-white/10'
        }`}
      >
        <div className="flex items-start gap-4">
          {isFeaturedAcademy ? (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-600/20 text-red-400">
              <Building2 className="h-6 w-6" />
            </div>
          ) : null}

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${type.className}`}
              >
                <TypeIcon className="h-3 w-3" />
                {type.label}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                  isFeaturedAcademy
                    ? 'border-red-500/30 bg-red-600/10 text-red-300'
                    : 'border-white/10 bg-zinc-900 text-zinc-400'
                }`}
              >
                <SourceIcon className="h-3 w-3" />
                {warning.source === 'academy' ? 'Academia' : 'Meu aviso'}
              </span>
            </div>
            <h3
              className={`font-semibold text-white ${
                isFeaturedAcademy ? 'text-xl' : 'text-base'
              }`}
            >
              {warning.title}
            </h3>
          </div>
        </div>
      </header>

      <div className="flex-1 p-5">
        <p
          className={`leading-7 text-zinc-300 ${
            isFeaturedAcademy ? 'text-base' : 'text-sm'
          }`}
        >
          {warning.content}
        </p>

        <div className="mt-5 grid gap-2 border-t border-white/5 pt-4 text-xs text-zinc-500 sm:grid-cols-2">
          <p className="flex items-center gap-2">
            <UserRound className="h-3.5 w-3.5 shrink-0 text-red-500" />
            Para: {warning.audienceLabel}
          </p>
          <p>Por: {warning.createdByName}</p>
          <p>Publicado em: {formatDate(warning.publishedAt)}</p>
          <p>
            Validade:{' '}
            {warning.expiresAt ? formatDate(warning.expiresAt) : 'Sem expiração'}
          </p>
        </div>
      </div>

      {warning.canDelete && onDelete ? (
        <footer className="border-t border-white/10 p-4">
          <button
            type="button"
            disabled={isDeleting}
            onClick={() => onDelete(warning.id)}
            className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isDeleting ? 'Removendo...' : 'Remover aviso'}
          </button>
        </footer>
      ) : null}
    </article>
  );
}
