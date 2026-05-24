'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import {
  AlertTriangle,
  CheckCheck,
  Info,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  markAllStudentWarningsReadAction,
  markStudentWarningReadAction,
} from '@/modules/student-portal/actions/mark-student-warning-read';
import type { StudentWarningPageItem } from '@/modules/student-portal/queries/get-student-warnings-page';
import type { WarningType } from '@/modules/warnings/types/warnings';

type StudentWarningsViewProps = {
  warnings: StudentWarningPageItem[];
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

function formatDate(date: Date) {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function StudentWarningsView({ warnings }: StudentWarningsViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const unreadCount = warnings.filter((warning) => !warning.isRead).length;

  const handleMarkRead = (announcementId: string) => {
    startTransition(async () => {
      const result = await markStudentWarningReadAction({ announcementId });

      if (result.success) {
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  };

  const handleMarkAllRead = () => {
    startTransition(async () => {
      const result = await markAllStudentWarningsReadAction();

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        return;
      }

      toast.error(result.message);
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
          Comunicados
        </p>
        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Avisos
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-zinc-400">
              Avisos da academia e da sua turma. Novos avisos ficam em destaque
              até você marcar como visto.
            </p>
          </div>

          {unreadCount > 0 ? (
            <button
              type="button"
              disabled={isPending}
              onClick={handleMarkAllRead}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-500/30 bg-red-600/10 px-4 text-sm font-medium text-red-300 transition hover:bg-red-600/20 disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todos como lidos
            </button>
          ) : null}
        </div>
      </section>

      {warnings.length > 0 ? (
        <div className="space-y-4">
          {warnings.map((warning) => {
            const type = typeConfig[warning.type];
            const TypeIcon = type.Icon;
            const isUnread = !warning.isRead;

            return (
              <article
                key={warning.id}
                className={`rounded-2xl border p-5 ${
                  isUnread
                    ? 'border-red-500/30 bg-red-500/5 shadow-[0_0_0_1px_rgba(239,68,68,0.08)]'
                    : 'border-white/10 bg-zinc-950'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${type.className}`}
                    >
                      <TypeIcon className="h-3 w-3" />
                      {type.label}
                    </span>
                    {isUnread ? (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Novo
                      </span>
                    ) : null}
                  </div>

                  {isUnread ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleMarkRead(warning.id)}
                      className="inline-flex h-9 items-center rounded-xl border border-white/10 px-3 text-xs font-medium text-zinc-300 transition hover:bg-zinc-900 disabled:opacity-50"
                    >
                      Marcar como visto
                    </button>
                  ) : null}
                </div>

                <h2 className="mt-4 text-lg font-semibold text-white">
                  {warning.title}
                </h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-400">
                  {warning.content}
                </p>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-zinc-500">
                  <span>{formatDate(warning.publishedAt)}</span>
                  <span>·</span>
                  <span>{warning.audienceLabel}</span>
                  <span>·</span>
                  <span>{warning.createdByName}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-zinc-950 px-6 py-16 text-center">
          <Megaphone className="mx-auto h-8 w-8 text-zinc-600" />
          <p className="mt-3 text-sm text-zinc-400">
            Nenhum aviso ativo no momento.
          </p>
        </div>
      )}
    </div>
  );
}
