'use client';

import { useState, useTransition } from 'react';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { updateStudentStatusAction } from '../actions/update-student-status';
import type { CancellationReasonOption } from '../queries/get-cancellation-reasons';
import type { StudentStatus } from '../types/student-status';

type StatusOption = {
  value: StudentStatus;
  label: string;
  hint: string;
};

const STATUS_OPTIONS: StatusOption[] = [
  { value: 'ACTIVE', label: 'Ativo', hint: 'Treinando regularmente.' },
  {
    value: 'FROZEN',
    label: 'Trancado',
    hint: 'Pausa temporária com previsão de retorno.',
  },
  {
    value: 'INACTIVE',
    label: 'Inativo',
    hint: 'Parou de treinar sem cancelamento formal.',
  },
  {
    value: 'CANCELED',
    label: 'Cancelado',
    hint: 'Saída definitiva — exige motivo.',
  },
];

type UpdateStudentStatusDialogProps = {
  studentId: string;
  currentStatus: StudentStatus;
  reasons: CancellationReasonOption[];
};

export function UpdateStudentStatusDialog({
  studentId,
  currentStatus,
  reasons,
}: UpdateStudentStatusDialogProps) {
  const [open, setOpen] = useState(false);
  const [toStatus, setToStatus] = useState<StudentStatus>(currentStatus);
  const [reasonId, setReasonId] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isPending, startTransition] = useTransition();

  const needsReason = toStatus === 'CANCELED';

  function handleConfirm() {
    if (toStatus === currentStatus) {
      toast.info('Selecione um status diferente do atual.');
      return;
    }

    if (needsReason && !reasonId) {
      toast.error('Selecione o motivo do cancelamento.');
      return;
    }

    startTransition(async () => {
      const result = await updateStudentStatusAction({
        studentId,
        toStatus,
        reasonId: needsReason ? reasonId : undefined,
        notes: notes.trim() || undefined,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      setOpen(false);
      setNotes('');
      setReasonId(undefined);
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) {
          setToStatus(currentStatus);
          setReasonId(undefined);
          setNotes('');
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="gap-2 border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
        >
          <ShieldCheck className="h-4 w-4" />
          Alterar status
        </Button>
      </DialogTrigger>

      <DialogContent className="scrollbar-hide max-h-[90vh] overflow-y-auto border-white/10 bg-zinc-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Alterar status do aluno</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Toda mudança fica registrada no histórico do aluno.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Novo status</Label>
            <Select
              value={toStatus}
              onValueChange={(value) => setToStatus(value as StudentStatus)}
            >
              <SelectTrigger className="border-white/10 bg-zinc-900 text-white">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-zinc-950 text-white">
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="focus:bg-zinc-900 focus:text-white"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{option.label}</span>
                      <span className="text-[11px] text-zinc-500">
                        {option.hint}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {needsReason && (
            <div className="space-y-2">
              <Label className="text-zinc-300">
                Motivo do cancelamento
                <span className="ml-1 text-red-400">*</span>
              </Label>
              {reasons.length === 0 ? (
                <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300">
                  Cadastre motivos de cancelamento antes de prosseguir.
                </p>
              ) : (
                <Select value={reasonId} onValueChange={setReasonId}>
                  <SelectTrigger className="border-white/10 bg-zinc-900 text-white">
                    <SelectValue placeholder="Selecione um motivo" />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-zinc-950 text-white">
                    {reasons.map((reason) => (
                      <SelectItem
                        key={reason.id}
                        value={reason.id}
                        className="focus:bg-zinc-900 focus:text-white"
                      >
                        {reason.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-zinc-300">Observação (opcional)</Label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Contexto adicional sobre a mudança..."
              rows={3}
              maxLength={500}
              className="resize-none border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
            className="border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isPending || (needsReason && reasons.length === 0)}
            className="bg-red-600 text-white hover:bg-red-500"
          >
            {isPending ? 'Salvando...' : 'Confirmar mudança'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
