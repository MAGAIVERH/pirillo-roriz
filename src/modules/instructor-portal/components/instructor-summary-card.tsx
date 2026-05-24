import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type InstructorSummaryCardProps = {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  href: string;
  highlight?: 'default' | 'success' | 'warning' | 'danger';
};

const highlightStyles = {
  default: {
    card: 'border-white/10 bg-zinc-950 hover:border-white/20 hover:bg-zinc-900/60',
    icon: 'bg-red-600/15 text-red-500',
    value: 'text-white',
  },
  success: {
    card: 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/30 hover:bg-emerald-500/10',
    icon: 'bg-emerald-500/15 text-emerald-400',
    value: 'text-emerald-300',
  },
  warning: {
    card: 'border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30 hover:bg-amber-500/10',
    icon: 'bg-amber-500/15 text-amber-400',
    value: 'text-amber-300',
  },
  danger: {
    card: 'border-red-500/20 bg-red-500/5 hover:border-red-500/30 hover:bg-red-500/10',
    icon: 'bg-red-500/15 text-red-400',
    value: 'text-red-300',
  },
} as const;

export function InstructorSummaryCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  highlight = 'default',
}: InstructorSummaryCardProps) {
  const style = highlightStyles[highlight];

  return (
    <Link
      href={href}
      className={`group block min-w-0 rounded-2xl border p-4 transition sm:p-5 ${style.card}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm text-zinc-400">{title}</p>
          <p
            className={`text-2xl font-bold tracking-tight break-words sm:text-3xl ${style.value}`}
          >
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="text-sm leading-6 break-words text-zinc-400">{description}</p>
    </Link>
  );
}
