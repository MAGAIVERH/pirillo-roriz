import Link from 'next/link';
import { ArrowRight, CircleDollarSign } from 'lucide-react';

import type { DashboardFinancePulse } from '../types/dashboard';

type DashboardFinancePulseCardProps = {
  finance: DashboardFinancePulse;
};

export function DashboardFinancePulseCard({
  finance,
}: DashboardFinancePulseCardProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-zinc-950 p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
            <CircleDollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Pulso financeiro</h2>
            <p className="text-xs text-zinc-400">
              Resumo das mensalidades deste mês.
            </p>
          </div>
        </div>

        <Link
          href="/admin/financeiro"
          className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 transition hover:text-red-300"
        >
          Abrir financeiro
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <dl className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <dt className="text-xs text-zinc-400">Pago no mês</dt>
          <dd className="mt-1 text-xl font-bold text-emerald-300">
            {finance.paidThisMonthLabel}
          </dd>
          <p className="mt-1 text-[11px] text-zinc-500">
            {finance.paidInvoices} fatura(s) confirmada(s)
          </p>
        </div>

        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <dt className="text-xs text-zinc-400">A vencer este mês</dt>
          <dd className="mt-1 text-xl font-bold text-amber-300">
            {finance.pendingThisMonthLabel}
          </dd>
          <p className="mt-1 text-[11px] text-zinc-500">
            {finance.upcomingInvoices} vencendo nos próximos 7 dias
          </p>
        </div>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
          <dt className="text-xs text-zinc-400">Em atraso</dt>
          <dd className="mt-1 text-xl font-bold text-red-300">
            {finance.overdueLabel}
          </dd>
          <p className="mt-1 text-[11px] text-zinc-500">
            {finance.overdueInvoices} fatura(s) vencida(s)
          </p>
        </div>
      </dl>
    </section>
  );
}
