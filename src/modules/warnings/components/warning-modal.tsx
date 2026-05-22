'use client';

import { useState, useTransition } from 'react';
import {
  AlertTriangle,
  GraduationCap,
  Info,
  Megaphone,
  Tag,
  UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type { WarningInput } from '../schemas/warning-schema';
import type { Warning, WarningType, WarningVisibility } from '../types/warnings';
import {
  DateRangePicker,
  type WarningDateRange,
} from './date-range-picker';

type WarningModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warning: Warning | null;
  onSave: (
    data: WarningInput,
    id?: string,
  ) => Promise<{ success: boolean; message: string }>;
};

function endOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function WarningModal({
  open,
  onOpenChange,
  warning,
  onSave,
}: WarningModalProps) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(warning?.title ?? '');
  const [content, setContent] = useState(warning?.content ?? '');
  const [type, setType] = useState<WarningType>(warning?.type ?? 'info');
  const [visibility, setVisibility] = useState<WarningVisibility>(
    warning?.visibility ?? 'todos',
  );
  const [range, setRange] = useState<WarningDateRange>({
    from: warning?.publishedAt ?? null,
    to: warning?.expiresAt ?? null,
  });

  function handleSave() {
    if (!title.trim() || !content.trim()) return;

    const normalizedFrom = range.from ? startOfDay(range.from) : null;
    const normalizedTo = range.to ? endOfDay(range.to) : null;

    startTransition(async () => {
      await onSave(
        {
          title: title.trim(),
          content: content.trim(),
          type,
          visibility,
          publishNow: false,
          publishedAt: normalizedFrom?.toISOString(),
          expiresAt: normalizedTo?.toISOString(),
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-hide max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border-white/10 bg-zinc-950 p-6 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            {warning ? 'Editar aviso' : 'Novo aviso'}
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            Comunicados aparecem nas plataformas conforme o público selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="warning-title" className="text-xs text-zinc-400">
              Título
            </Label>
            <Input
              id="warning-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Treino cancelado nesta sexta"
              className="h-10 rounded-xl border-white/10 bg-zinc-900 px-4 text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="warning-content" className="text-xs text-zinc-400">
              Mensagem
            </Label>
            <Textarea
              id="warning-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="Escreva o comunicado para alunos e/ou professores..."
              className="resize-none rounded-xl border-white/10 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Tipo do aviso</Label>
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

          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Visível para</Label>
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

          <div className="space-y-1.5 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
            <Label className="text-xs text-zinc-400">
              Vigência do aviso
            </Label>
            <DateRangePicker
              value={range}
              onChange={setRange}
              placeholder="Início → expiração"
            />
            <p className="text-[11px] leading-5 text-zinc-500">
              Selecione a data de publicação e a data em que o aviso será
              removido automaticamente. Sem período → salvo como rascunho.
            </p>
          </div>
        </div>

        <div className="mt-2 flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-10 flex-1 rounded-xl border-white/10 bg-transparent text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="h-10 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-500"
          >
            {isPending ? 'Salvando...' : 'Salvar aviso'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
