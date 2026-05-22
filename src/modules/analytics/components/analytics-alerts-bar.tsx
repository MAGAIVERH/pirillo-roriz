import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

import type {
  AnalyticsAlert,
  AnalyticsAlertTone,
} from '../types/analytics';

const toneStyles: Record<
  AnalyticsAlertTone,
  { border: string; bg: string; text: string; icon: LucideIcon }
> = {
  critical: {
    border: 'border-red-500/30',
    bg: 'bg-red-500/5',
    text: 'text-red-400',
    icon: AlertOctagon,
  },
  warning: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/5',
    text: 'text-amber-400',
    icon: AlertTriangle,
  },
  opportunity: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/5',
    text: 'text-emerald-400',
    icon: Sparkles,
  },
  info: {
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    text: 'text-blue-400',
    icon: Info,
  },
};

type AnalyticsAlertsBarProps = {
  alerts: AnalyticsAlert[];
};

export function AnalyticsAlertsBar({ alerts }: AnalyticsAlertsBarProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Alertas inteligentes
      </h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {alerts.map((alert) => {
          const style = toneStyles[alert.tone];
          const Icon = style.icon;

          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${style.border} ${style.bg}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.text} bg-black/30`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${style.text}`}>
                  {alert.message}
                </p>
                {alert.hint && (
                  <p className="mt-1 text-xs leading-5 text-zinc-400">
                    {alert.hint}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
