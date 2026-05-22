'use client';

import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const MONTHS = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

type FinanceReportFilterProps = {
  month: number;
  year: number;
};

export const FinanceReportFilter = ({
  month,
  year,
}: FinanceReportFilterProps) => {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <div className='grid w-full grid-cols-2 gap-3 sm:max-w-xs'>
      <Select
        value={String(month)}
        onValueChange={(val) =>
          router.push(`/admin/financeiro/relatorios?month=${val}&year=${year}`)
        }
      >
        <SelectTrigger className='w-full border-white/10 bg-zinc-900 text-white hover:bg-zinc-800'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='border-white/10 bg-zinc-950 text-white'>
          {MONTHS.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(year)}
        onValueChange={(val) =>
          router.push(`/admin/financeiro/relatorios?month=${month}&year=${val}`)
        }
      >
        <SelectTrigger className='w-full border-white/10 bg-zinc-900 text-white hover:bg-zinc-800'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className='border-white/10 bg-zinc-950 text-white'>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
