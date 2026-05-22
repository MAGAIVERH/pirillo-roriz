'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Plus } from 'lucide-react';
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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { createWarningAction } from '../actions/create-warning';
import { deleteWarningAction } from '../actions/delete-warning';
import { updateWarningAction } from '../actions/update-warning';
import type { WarningInput } from '../schemas/warning-schema';
import type { Warning, WarningStatus } from '../types/warnings';
import { WarningCard } from './warning-card';
import { WarningModal } from './warning-modal';

type WarningsClientViewProps = {
  initialWarnings: Warning[];
};

type StatusFilter = 'todos' | WarningStatus;

const filterTabs: { id: StatusFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'ativo', label: 'Ativos' },
  { id: 'rascunho', label: 'Rascunhos' },
  { id: 'agendado', label: 'Agendados' },
  { id: 'expirado', label: 'Expirados' },
];

export function WarningsClientView({ initialWarnings }: WarningsClientViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Warning | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredWarnings = useMemo(() => {
    return initialWarnings.filter((warning) => {
      const matchesStatus =
        statusFilter === 'todos' || warning.status === statusFilter;

      const matchesSearch =
        warning.title.toLowerCase().includes(search.toLowerCase()) ||
        warning.content.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [initialWarnings, statusFilter, search]);

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(warning: Warning) {
    setEditing(warning);
    setModalOpen(true);
  }

  function refreshAfterMutation(message: string) {
    toast.success(message);
    setModalOpen(false);
    setDeleteTargetId(null);
    setTimeout(() => {
      router.refresh();
    }, 400);
  }

  async function handleSave(data: WarningInput, id?: string) {
    const result = id
      ? await updateWarningAction(id, data)
      : await createWarningAction(data);

    if (!result.success) {
      toast.error(result.message);
      return { success: false, message: result.message };
    }

    refreshAfterMutation(result.message);
    return result;
  }

  function handleDelete(id: string) {
    setDeleteTargetId(id);
  }

  function confirmDelete() {
    if (!deleteTargetId) return;

    startTransition(async () => {
      const result = await deleteWarningAction(deleteTargetId);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      refreshAfterMutation(result.message);
    });
  }

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-6">
        <div className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid w-full grid-cols-6 gap-1.5 sm:flex sm:w-auto sm:flex-wrap sm:gap-1">
            {filterTabs.map((tab, index) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`flex items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition sm:col-span-auto sm:flex-initial sm:px-3 sm:py-1.5 ${
                  index < 3 ? 'col-span-2' : 'col-span-3'
                } ${
                  statusFilter === tab.id
                    ? 'bg-red-500/15 text-red-400'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            type="button"
            onClick={openNew}
            className="h-10 w-full shrink-0 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500 sm:w-auto lg:h-9"
          >
            <Plus className="h-4 w-4" />
            Novo aviso
          </Button>
        </div>

        <div className="space-y-4">
          <Input
            type="text"
            placeholder="Buscar aviso..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-10 w-full rounded-xl border-white/10 bg-zinc-900 px-4 text-sm text-white placeholder:text-zinc-500 sm:max-w-xs"
          />

          <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-300">
            Os avisos publicados aparecem nas plataformas de alunos e
            professores conforme o público selecionado. Não há compra ou
            pagamento — apenas comunicação.
          </p>

          {filteredWarnings.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-zinc-500">
              <Megaphone className="h-10 w-10 opacity-40" />
              <span className="text-sm">Nenhum aviso encontrado</span>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredWarnings.map((warning) => (
                <WarningCard
                  key={warning.id}
                  warning={warning}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border-white/10 bg-zinc-950">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-white">
              Remover aviso?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-zinc-400">
              Esta ação não pode ser desfeita. O comunicado deixará de aparecer
              nas plataformas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-9 rounded-xl border-white/10 bg-transparent text-sm text-zinc-400 hover:bg-zinc-900 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending}
              onClick={(event) => {
                event.preventDefault();
                confirmDelete();
              }}
              className="h-9 rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-500"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {modalOpen && (
        <WarningModal
          key={editing?.id ?? 'new'}
          open={modalOpen}
          onOpenChange={setModalOpen}
          warning={editing}
          onSave={handleSave}
        />
      )}
    </>
  );
}
