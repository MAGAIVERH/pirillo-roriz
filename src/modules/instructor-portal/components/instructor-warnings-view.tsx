'use client';

import { useMemo, useState, useTransition } from 'react';
import { Building2, Megaphone, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import { createInstructorWarningAction } from '@/modules/instructor-portal/actions/create-instructor-warning';
import { deleteInstructorWarningAction } from '@/modules/instructor-portal/actions/delete-instructor-warning';
import { InstructorWarningModal } from '@/modules/instructor-portal/components/instructor-warning-modal';
import { WarningCatalogCard } from '@/modules/instructor-portal/components/warning-catalog-card';
import type {
  InstructorClassOption,
  InstructorWarningListItem,
} from '@/modules/instructor-portal/types/instructor-warnings';
import type { InstructorWarningInput } from '@/modules/instructor-portal/schemas/instructor-warning-schema';

type InstructorWarningsViewProps = {
  academyWarnings: InstructorWarningListItem[];
  myWarnings: InstructorWarningListItem[];
  classes: InstructorClassOption[];
};

export function InstructorWarningsView({
  academyWarnings,
  myWarnings,
  classes,
}: InstructorWarningsViewProps) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filterWarnings = (warnings: InstructorWarningListItem[]) => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return warnings;
    }

    return warnings.filter((warning) => {
      return (
        warning.title.toLowerCase().includes(normalizedSearch) ||
        warning.content.toLowerCase().includes(normalizedSearch) ||
        warning.audienceLabel.toLowerCase().includes(normalizedSearch) ||
        warning.createdByName.toLowerCase().includes(normalizedSearch)
      );
    });
  };

  const filteredAcademyWarnings = useMemo(
    () => filterWarnings(academyWarnings),
    [academyWarnings, search],
  );
  const filteredMyWarnings = useMemo(
    () => filterWarnings(myWarnings),
    [myWarnings, search],
  );

  const handleCreate = (data: InstructorWarningInput) => {
    startTransition(async () => {
      const result = await createInstructorWarningAction(data);

      if (result.success) {
        toast.success(result.message);
        setModalOpen(false);
        return;
      }

      toast.error(result.message);
    });
  };

  const handleDelete = (warningId: string) => {
    setDeletingId(warningId);

    startTransition(async () => {
      const result = await deleteInstructorWarningAction({ warningId });
      setDeletingId(null);

      if (result.success) {
        toast.success(result.message);
        return;
      }

      toast.error(result.message);
    });
  };

  const myWarningsGridClassName =
    filteredMyWarnings.length === 1
      ? 'mx-auto grid w-full max-w-md gap-4'
      : filteredMyWarnings.length === 2
        ? 'grid gap-4 sm:grid-cols-2'
        : 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3';

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950 px-3 text-zinc-400">
          <Search className="h-4 w-4 shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar aviso..."
            className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />
        </div>

        <button
          type="button"
          disabled={classes.length === 0 || isPending}
          onClick={() => setModalOpen(true)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4 shrink-0" />
          Novo aviso
        </button>
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-white">
                Avisos da academia
              </h2>
              <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400">
                {filteredAcademyWarnings.length}
              </span>
            </div>
          </div>
        </div>

        {filteredAcademyWarnings.length > 0 ? (
          <div className="space-y-4">
            {filteredAcademyWarnings.map((warning) => (
              <WarningCatalogCard
                key={warning.id}
                warning={warning}
                featured
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 px-6 py-10 text-center">
            <Building2 className="mx-auto h-7 w-7 text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-400">
              Nenhum aviso da academia no momento.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-zinc-400">
            <Megaphone className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-white">
                Meus avisos para alunos
              </h2>
              <span className="rounded-full border border-white/10 bg-zinc-900 px-2.5 py-0.5 text-xs font-semibold text-zinc-400">
                {filteredMyWarnings.length}
              </span>
            </div>
          </div>
        </div>

        {filteredMyWarnings.length > 0 ? (
          <div className={myWarningsGridClassName}>
            {filteredMyWarnings.map((warning) => (
              <WarningCatalogCard
                key={warning.id}
                warning={warning}
                onDelete={handleDelete}
                isDeleting={deletingId === warning.id}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 px-6 py-10 text-center">
            <Megaphone className="mx-auto h-7 w-7 text-zinc-600" />
            <p className="mt-3 text-sm text-zinc-400">
              Você ainda não enviou avisos para seus alunos.
            </p>
          </div>
        )}
      </section>

      <InstructorWarningModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        classes={classes}
        onSave={handleCreate}
        isPending={isPending}
      />
    </div>
  );
}
