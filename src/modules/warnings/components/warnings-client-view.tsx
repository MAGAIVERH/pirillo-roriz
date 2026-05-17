'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Megaphone, Plus } from 'lucide-react';
import { toast } from 'sonner';

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
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  statusFilter === tab.id
                    ? 'bg-red-500/15 text-red-400'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={openNew}
            className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            <Plus className="h-4 w-4" />
            Novo aviso
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Buscar aviso..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-xs rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-red-500/50"
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

      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6">
            <h3 className="text-lg font-semibold text-white">Remover aviso?</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Esta ação não pode ser desfeita. O comunicado deixará de aparecer
              nas plataformas.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-zinc-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <WarningModal
          warning={editing}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

