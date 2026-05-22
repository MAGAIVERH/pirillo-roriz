import Link from 'next/link';
import { AlertOctagon, ArrowRight, Bell, Info } from 'lucide-react';

import type { DashboardWarningPreview } from '../types/dashboard';

type DashboardWarningsCardProps = {
  warnings: DashboardWarningPreview[];
};

const TYPE_CONFIG: Record<
  DashboardWarningPreview['type'],
  { label: string; iconWrapper: string; icon: typeof Bell }
> = {
  info: {
    label: 'Informativo',
    iconWrapper: 'bg-blue-500/15 text-blue-400',
    icon: Info,
  },
  aviso: {
    label: 'Aviso',
    iconWrapper: 'bg-amber-500/15 text-amber-400',
    icon: Bell,
  },
  importante: {
    label: 'Importante',
    iconWrapper: 'bg-red-500/15 text-red-400',
    icon: AlertOctagon,
  },
};

export function DashboardWarningsCard({
  warnings,
}: DashboardWarningsCardProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Avisos ativos</h2>
          <p className="text-xs text-zinc-400">
            Comunicados mais recentes publicados para alunos e professores.
          </p>
        </div>

        <Link
          href="/admin/avisos"
          className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 transition hover:text-red-300"
        >
          Gerenciar
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      {warnings.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-zinc-900/50 p-4 text-sm text-zinc-400">
          Nenhum aviso ativo no momento.
        </p>
      ) : (
        <ul className="space-y-2">
          {warnings.map((warning) => {
            const config = TYPE_CONFIG[warning.type];
            const Icon = config.icon;

            return (
              <li
                key={warning.id}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-zinc-900/50 p-3"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconWrapper}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {warning.title}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {warning.publishedAt
                      ? `Publicado em ${warning.publishedAt}`
                      : 'Rascunho'}
                    {warning.expiresAt
                      ? ` · expira em ${warning.expiresAt}`
                      : ''}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
