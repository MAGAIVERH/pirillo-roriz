'use client';

import {
  AlertTriangle,
  GraduationCap,
  Info,
  Megaphone,
  Pencil,
  Tag,
  Trash2,
  UserRound,
} from 'lucide-react';

import type { Warning } from '../types/warnings';

type WarningCardProps = {
  warning: Warning;
  onEdit: (warning: Warning) => void;
  onDelete: (id: string) => void;
};

const visibilityLabels: Record<Warning['visibility'], string> = {
  todos: 'Todos',
  alunos: 'Alunos',
  professores: 'Professores',
};

const typeConfig: Record<
  Warning['type'],
  { label: string; className: string; Icon: React.ElementType }
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

const statusConfig: Record<
  Warning['status'],
  { label: string; className: string }
> = {
  rascunho: {
    label: 'Rascunho',
    className: 'bg-zinc-800 text-zinc-400',
  },
  agendado: {
    label: 'Agendado',
    className: 'bg-amber-500/15 text-amber-400',
  },
  ativo: {
    label: 'Ativo',
    className: 'bg-emerald-400/15 text-emerald-400',
  },
  expirado: {
    label: 'Expirado',
    className: 'bg-zinc-800 text-zinc-500',
  },
};

function formatDate(date: Date | null) {
  if (!date) return '—';
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function WarningCard({ warning, onEdit, onDelete }: WarningCardProps) {
  const type = typeConfig[warning.type];
  const status = statusConfig[warning.status];
  const TypeIcon = type.Icon;

  return (
    <article className="flex flex-col rounded-2xl border border-white/10 bg-zinc-900">
      <header className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${type.className}`}
            >
              <TypeIcon className="h-3 w-3" />
              {type.label}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </div>
          <h3 className="truncate text-sm font-semibold text-white">
            {warning.title}
          </h3>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[10px] text-zinc-300">
          {warning.visibility === 'alunos' && (
            <GraduationCap className="h-3 w-3" />
          )}
          {warning.visibility === 'professores' && (
            <UserRound className="h-3 w-3" />
          )}
          {warning.visibility === 'todos' && <Tag className="h-3 w-3" />}
          {visibilityLabels[warning.visibility]}
        </span>
      </header>

      <div className="flex-1 p-4">
        <p className="line-clamp-3 text-sm leading-6 text-zinc-400">
          {warning.content}
        </p>
        <div className="mt-3 space-y-1 text-xs text-zinc-500">
          <p>Publicação: {formatDate(warning.publishedAt)}</p>
          <p>Validade: {warning.expiresAt ? formatDate(warning.expiresAt) : 'Sem expiração'}</p>
          <p>Por {warning.createdByName}</p>
        </div>
      </div>

      <footer className="flex gap-2 border-t border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={() => onEdit(warning)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 py-1.5 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          <Pencil className="h-3 w-3" /> Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(warning.id)}
          className="flex items-center justify-center rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-500 transition hover:border-red-500/30 hover:text-red-400"
          aria-label="Excluir aviso"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </footer>
    </article>
  );
}
