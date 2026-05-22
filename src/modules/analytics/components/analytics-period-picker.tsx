'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

type AnalyticsPeriodPickerProps = {
  currentLabel: string;
  currentYear: number;
  currentMonth: number;
};

export function AnalyticsPeriodPicker({
  currentLabel,
  currentYear,
  currentMonth,
}: AnalyticsPeriodPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function applyPeriod(year: number, month: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('ano', String(year));
    params.set('mes', String(month));

    startTransition(() => {
      router.replace(`?${params.toString()}`, { scroll: false });
    });
  }

  const now = new Date();
  const years = Array.from({ length: 5 }, (_, idx) => now.getFullYear() - idx);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isPending}
          className="h-10 gap-2 rounded-xl border-white/10 bg-zinc-900 px-4 text-sm text-white hover:bg-zinc-800"
        >
          {currentLabel}
          <ChevronDown className="h-4 w-4 text-zinc-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="max-h-[420px] w-56 overflow-y-auto rounded-2xl border-white/10 bg-zinc-950 p-2"
      >
        {years.map((year) => (
          <div key={year} className="space-y-0.5">
            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-500">
              {year}
            </DropdownMenuLabel>
            {MONTHS.map((monthName, index) => {
              const month = index + 1;
              const isActive = currentYear === year && currentMonth === month;
              return (
                <DropdownMenuItem
                  key={`${year}-${month}`}
                  onClick={() => applyPeriod(year, month)}
                  className={`cursor-pointer rounded-lg text-sm ${
                    isActive
                      ? 'bg-red-500/10 text-red-400 focus:bg-red-500/20 focus:text-red-300'
                      : 'text-zinc-300 focus:bg-zinc-900 focus:text-white'
                  }`}
                >
                  {monthName}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator className="my-1 bg-white/5" />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
