import type { LucideIcon } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

type StudentDetailInfoCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
};

export function StudentDetailInfoCard({
  title,
  value,
  icon: Icon,
}: StudentDetailInfoCardProps) {
  return (
    <Card className="border-white/10 bg-zinc-950 text-white">
      <CardContent className="flex items-start justify-between gap-4 px-5 py-3">
        <div className="min-w-0 space-y-2">
          <p className="text-base font-semibold text-white">{title}</p>
          <p className="wrap-break-word text-sm text-zinc-300">{value}</p>
        </div>

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600/15 text-red-400">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

export const getStudentOperationalStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    LEAD: 'Interessado',
    TRIAL: 'Experimental',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    FROZEN: 'Trancado',
    CANCELED: 'Cancelado',
    DELINQUENT: 'Inadimplente',
  };

  return map[status] ?? status;
};

export const getStudentFinancialStatusLabel = (status: string) => {
  if (status === 'DELINQUENT') {
    return 'Inadimplente';
  }

  return 'Sem pendência';
};

export const formatStudentPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }

  return value;
};
