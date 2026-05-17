import {
  AlertTriangle,
  Clock3,
  FileText,
  Megaphone,
} from 'lucide-react';

import { WarningsClientView } from '@/modules/warnings/components/warnings-client-view';
import { getWarnings } from '@/modules/warnings/queries/get-warnings';
import { getWarningsOverviewStats } from '@/modules/warnings/queries/get-warnings-overview-stats';

export default async function AdminAvisosPage() {
  const [warnings, stats] = await Promise.all([
    getWarnings(),
    getWarningsOverviewStats(),
  ]);

  const metricCards = [
    {
      title: 'Total de avisos',
      value: String(stats.total),
      desc: 'Comunicados cadastrados na academia.',
      icon: Megaphone,
      alert: false,
    },
    {
      title: 'Ativos e agendados',
      value: String(stats.active),
      desc: 'Visíveis ou programados para publicação.',
      icon: FileText,
      alert: false,
    },
    {
      title: 'Rascunhos',
      value: String(stats.drafts),
      desc: 'Ainda não publicados.',
      icon: Clock3,
      alert: stats.drafts > 0,
    },
    {
      title: 'Expirados',
      value: String(stats.expired),
      desc: 'Fora do período de validade.',
      icon: AlertTriangle,
      alert: stats.expired > 0,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-red-500">
            Módulo
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            Avisos e comunicados
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-zinc-400">
            Publique comunicados para alunos, professores ou toda a academia.
            Os avisos aparecem nas plataformas conforme o público selecionado,
            com tipo, validade e status de publicação.
          </p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(({ title, value, desc, icon: Icon, alert }) => (
          <div
            key={title}
            className={`rounded-2xl border p-5 ${
              alert
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-white/10 bg-zinc-950'
            }`}
          >
            <div className="flex items-start justify-between">
              <p className="text-sm font-medium text-zinc-400">{title}</p>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  alert
                    ? 'bg-red-600/20 text-red-400'
                    : 'bg-red-600/15 text-red-500'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p
              className={`mt-3 text-3xl font-bold ${alert ? 'text-red-400' : 'text-white'}`}
            >
              {value}
            </p>
            <p className="mt-2 text-sm text-zinc-400">{desc}</p>
          </div>
        ))}
      </section>

      <WarningsClientView initialWarnings={warnings} />
    </div>
  );
}
