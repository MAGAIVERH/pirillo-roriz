'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  AlertTriangle,
  GraduationCap,
  Info,
  Megaphone,
  Users,
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
import type { InstructorWarningInput } from '@/modules/instructor-portal/schemas/instructor-warning-schema';
import type { InstructorClassOption } from '@/modules/instructor-portal/types/instructor-warnings';
import type { WarningType } from '@/modules/warnings/types/warnings';
import type { LucideIcon } from 'lucide-react';

type InstructorWarningModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: InstructorClassOption[];
  onSave: (data: InstructorWarningInput) => void;
  isPending: boolean;
};

export function InstructorWarningModal({
  open,
  onOpenChange,
  classes,
  onSave,
  isPending,
}: InstructorWarningModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<WarningType>('info');
  const [audience, setAudience] = useState<'all_my_students' | 'class'>(
    classes.length > 1 ? 'all_my_students' : 'class',
  );
  const [classId, setClassId] = useState(classes[0]?.id ?? '');
  const [, startResetTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    startResetTransition(() => {
      setTitle('');
      setContent('');
      setType('info');
      setAudience(classes.length > 1 ? 'all_my_students' : 'class');
      setClassId(classes[0]?.id ?? '');
    });
  }, [open, classes, startResetTransition]);

  const handleSave = () => {
    const resolvedAudience =
      classes.length > 1 ? audience : ('class' as const);
    const resolvedClassId =
      resolvedAudience === 'class'
        ? classId || classes[0]?.id
        : undefined;

    onSave({
      title: title.trim(),
      content: content.trim(),
      type,
      audience: resolvedAudience,
      classId: resolvedClassId,
    });
  };

  const typeOptions: {
    value: WarningType;
    label: string;
    Icon: LucideIcon;
  }[] = [
    { value: 'info', label: 'Informativo', Icon: Info },
    { value: 'aviso', label: 'Atenção', Icon: AlertTriangle },
    { value: 'importante', label: 'Importante', Icon: Megaphone },
  ];

  const audienceOptions =
    classes.length > 1
      ? [
          {
            value: 'all_my_students' as const,
            label: 'Todos os meus alunos',
            Icon: Users,
          },
          {
            value: 'class' as const,
            label: 'Turma específica',
            Icon: GraduationCap,
          },
        ]
      : [
          {
            value: 'class' as const,
            label: classes[0]?.name ?? 'Minha turma',
            Icon: GraduationCap,
          },
        ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="scrollbar-hide max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 p-6 text-white sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-white">
            Novo aviso para alunos
          </DialogTitle>
          <DialogDescription className="text-sm text-zinc-400">
            O comunicado aparecerá na plataforma dos alunos das turmas
            selecionadas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="instructor-warning-title" className="text-xs text-zinc-400">
              Título
            </Label>
            <Input
              id="instructor-warning-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex: Treino extra nesta semana"
              className="h-10 rounded-xl border-white/10 bg-zinc-900 px-4 text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="instructor-warning-content"
              className="text-xs text-zinc-400"
            >
              Mensagem
            </Label>
            <Textarea
              id="instructor-warning-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="Escreva o aviso para seus alunos..."
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
            <Label className="text-xs text-zinc-400">Enviar para</Label>
            <div className="flex flex-wrap gap-2">
              {audienceOptions.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setAudience(value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    audience === value
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

          {audience === 'class' && classes.length > 1 ? (
            <div className="space-y-1.5">
              <Label htmlFor="instructor-warning-class" className="text-xs text-zinc-400">
                Turma
              </Label>
              <select
                id="instructor-warning-class"
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-white outline-none"
              >
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
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
            disabled={isPending || !title.trim() || !content.trim()}
            className="h-10 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-500"
          >
            {isPending ? 'Enviando...' : 'Enviar aviso'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
