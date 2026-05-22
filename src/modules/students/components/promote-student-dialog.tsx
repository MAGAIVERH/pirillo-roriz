'use client';

import { useState, useTransition } from 'react';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { promoteStudentAction } from '../actions/promote-student';

type PromoteStudentDialogProps = {
  studentId: string;
  studentName: string;
  fromLabel: string;
  toLabel: string;
  triggerLabel?: string;
  size?: 'sm' | 'default';
};

export function PromoteStudentDialog({
  studentId,
  studentName,
  fromLabel,
  toLabel,
  triggerLabel = 'Graduar com sucesso',
  size = 'default',
}: PromoteStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await promoteStudentAction({
        studentId,
        notes: notes.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      setNotes('');
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          size={size}
          className="gap-2 bg-emerald-500 text-white hover:bg-emerald-400"
        >
          <GraduationCap className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-white/10 bg-zinc-950 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-white">
            <GraduationCap className="h-5 w-5 text-emerald-400" />
            Confirmar graduação
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2 text-zinc-400">
            <span className="block">
              Você está prestes a graduar{' '}
              <span className="font-semibold text-white">{studentName}</span>.
            </span>
            <span className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm">
              <span className="font-semibold text-zinc-200">{fromLabel}</span>
              <span aria-hidden className="text-zinc-500">
                →
              </span>
              <span className="font-semibold text-emerald-400">{toLabel}</span>
            </span>
            <span className="block text-xs text-zinc-500">
              A faixa atual será atualizada em todos os módulos do sistema e o
              evento ficará registrado no histórico do aluno.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2">
          <Label htmlFor="promotion-notes" className="text-zinc-300">
            Observação (opcional)
          </Label>
          <Textarea
            id="promotion-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Ex: graduação em cerimônia de fim de ciclo, destaque técnico na guarda..."
            maxLength={500}
            rows={3}
            className="resize-none border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleConfirm();
            }}
            disabled={isPending}
            className="bg-emerald-500 text-white hover:bg-emerald-400"
          >
            {isPending ? 'Salvando...' : 'Confirmar graduação'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
