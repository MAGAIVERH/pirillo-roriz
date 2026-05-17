'use client';

import { useState, useTransition } from 'react';
import {
  AlertTriangle,
  GraduationCap,
  Info,
  Megaphone,
  Tag,
  UserRound,
  X,
} from 'lucide-react';

import type { Warning, WarningType, WarningVisibility } from '../types/warnings';
import type { WarningInput } from '../schemas/warning-schema';

type WarningModalProps = {
  warning: Warning | null;
  onClose: () => void;
  onSave: (
    data: WarningInput,
    id?: string,
  ) => Promise<{ success: boolean; message: string }>;
};

function toDateTimeLocalValue(date: Date | null) {
  if (!date) return '';
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function WarningModal({ warning, onClose, onSave }: WarningModalProps) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(warning?.title ?? '');
  const [content, setContent] = useState(warning?.content ?? '');
  const [type, setType] = useState<WarningType>(warning?.type ?? 'info');
  const [visibility, setVisibility] = useState<WarningVisibility>(
    warning?.visibility ?? 'todos',
  );
  const [publishNow, setPublishNow] = useState(
    warning ? warning.status !== 'rascunho' : true,
  );
  const [publishedAt, setPublishedAt] = useState(
    toDateTimeLocalValue(warning?.publishedAt ?? null),
  );
  const [expiresAt, setExpiresAt] = useState(
    toDateTimeLocalValue(warning?.expiresAt ?? null),
  );

  function handleSave() {
    if (!title.trim() || !content.trim()) return;

    startTransition(async () => {
      await onSave(
        {
          title: title.trim(),
          content: content.trim(),
          type,
          visibility,
          publishNow,
          publishedAt: publishNow ? undefined : publishedAt || undefined,
          expiresAt: expiresAt || undefined,
        },
        warning?.id,
      );
    });
  }

  const typeOptions: {
    value: WarningType;
    label: string;
    Icon: React.ElementType;
  }[] = [
    { value: 'info', label: 'Informativo', Icon: Info },
    { value: 'aviso', label: 'Atenção', Icon: AlertTriangle },
    { value: 'importante', label: 'Importante', Icon: Megaphone },
  ];

  const visibilityOptions: {
    value: WarningVisibility;
    label: string;
    Icon: React.ElementType;
  }[] = [
    { value: 'todos', label: 'Todos', Icon: Tag },
    { value: 'alunos', label: 'Alunos', Icon: GraduationCap },
    { value: 'professores', label: 'Professores', Icon: UserRound },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {warning ? 'Editar aviso' : 'Novo aviso'}
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
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Treino cancelado nesta sexta"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-zinc-400">
              Mensagem
            </label>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="Escreva o comunicado para alunos e/ou professores..."
              className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 outline-none focus:border-red-500/50"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Tipo do aviso
            </label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setType(value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    type === value
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

          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-400">
              Visível para
            </label>
            <div className="flex flex-wrap gap-2">
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

          <div className="rounded-xl border border-white/10 bg-zinc-900/60 p-4 space-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={publishNow}
                onChange={(event) => setPublishNow(event.target.checked)}
                className="rounded border-white/20 bg-zinc-900"
              />
              Publicar imediatamente
            </label>

            {!publishNow && (
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                  Data de publicação
                </label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(event) => setPublishedAt(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-red-500/50"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">
                Expira em <span className="text-zinc-600">(opcional)</span>
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white outline-none focus:border-red-500/50"
              />
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
            {isPending ? 'Salvando...' : 'Salvar aviso'}
          </button>
        </div>

      </div>
    </div>
  );
}
