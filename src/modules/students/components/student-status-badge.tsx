import { Badge } from '@/components/ui/badge';
import type { StudentListStatus } from '@/modules/students/types/student-list-item';

type StudentStatusBadgeProps = {
  status: StudentListStatus;
};

const statusMap: Record<
  StudentListStatus,
  {
    label: string;
    className: string;
  }
> = {
  LEAD: {
    label: 'Lead',
    className:
      'border-sky-500/20 bg-sky-500/10 text-sky-400 hover:bg-sky-500/10',
  },
  TRIAL: {
    label: 'Experimental',
    className:
      'border-violet-500/20 bg-violet-500/10 text-violet-400 hover:bg-violet-500/10',
  },
  ACTIVE: {
    label: 'Ativo',
    className:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10',
  },
  INACTIVE: {
    label: 'Inativo',
    className:
      'border-zinc-500/20 bg-zinc-500/10 text-zinc-300 hover:bg-zinc-500/10',
  },
  FROZEN: {
    label: 'Trancado',
    className:
      'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/10',
  },
  CANCELED: {
    label: 'Cancelado',
    className:
      'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/10',
  },
  DELINQUENT: {
    label: 'Inadimplente',
    className:
      'border-orange-500/20 bg-orange-500/10 text-orange-400 hover:bg-orange-500/10',
  },
};

export const StudentStatusBadge = ({ status }: StudentStatusBadgeProps) => {
  const config = statusMap[status];

  return (
    <Badge
      variant='outline'
      className={`inline-flex w-28 justify-center rounded-full px-3 py-1 text-center text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
};
