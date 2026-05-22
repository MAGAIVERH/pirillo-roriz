import {
  AlertTriangle,
  CalendarClock,
  CreditCard,
  GraduationCap,
  ShoppingBag,
  Users,
  type LucideIcon,
} from 'lucide-react';

import type { DashboardStat } from '../types/dashboard';

const ICONS: Record<DashboardStat['id'], LucideIcon> = {
  activeStudents: Users,
  activeClasses: CalendarClock,
  eligibleForPromotion: GraduationCap,
  pendingReservations: ShoppingBag,
  mrr: CreditCard,
  overdueInvoices: AlertTriangle,
};

const HIGHLIGHT_STYLES: Record<
  NonNullable<DashboardStat['highlight']>,
  { iconWrapper: string; value: string }
> = {
  default: { iconWrapper: 'bg-red-600/15 text-red-500', value: 'text-white' },
  success: {
    iconWrapper: 'bg-emerald-500/15 text-emerald-400',
    value: 'text-emerald-300',
  },
  warning: {
    iconWrapper: 'bg-amber-500/15 text-amber-400',
    value: 'text-amber-300',
  },
  danger: {
    iconWrapper: 'bg-red-500/15 text-red-400',
    value: 'text-red-300',
  },
  info: {
    iconWrapper: 'bg-blue-500/15 text-blue-400',
    value: 'text-white',
  },
};

type DashboardStatsGridProps = {
  stats: DashboardStat[];
};

export function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => {
        const Icon = ICONS[stat.id];
        const style = HIGHLIGHT_STYLES[stat.highlight ?? 'default'];

        return (
          <article
            key={stat.id}
            className="min-w-0 rounded-2xl border border-white/10 bg-zinc-950 p-4 sm:p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-sm text-zinc-400">{stat.title}</p>
                <h2 className={`text-2xl font-bold tracking-tight break-words sm:text-3xl ${style.value}`}>
                  {stat.value}
                </h2>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconWrapper}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-sm leading-6 break-words text-zinc-400">{stat.description}</p>
          </article>
        );
      })}
    </section>
  );
}
