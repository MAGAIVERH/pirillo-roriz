'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type WarningDateRange = {
  from: Date | null;
  to: Date | null;
};

type DateRangePickerProps = {
  value: WarningDateRange;
  onChange: (value: WarningDateRange) => void;
  placeholder?: string;
  disabled?: boolean;
};

type SelectionStep = 'from' | 'to';

function startOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatLabel(value: WarningDateRange): string | null {
  if (value.from && value.to) {
    if (sameDay(value.from, value.to)) {
      return `${format(value.from, "dd 'de' MMM 'de' yyyy", { locale: ptBR })} (1 dia)`;
    }

    return `${format(value.from, "dd 'de' MMM", { locale: ptBR })} → ${format(
      value.to,
      "dd 'de' MMM 'de' yyyy",
      { locale: ptBR },
    )}`;
  }

  if (value.from) {
    return `${format(value.from, "dd 'de' MMM 'de' yyyy", { locale: ptBR })} → selecione o fim`;
  }

  return null;
}

function resolveInitialStep(value: WarningDateRange): SelectionStep {
  if (value.from && !value.to) {
    return 'to';
  }
  return 'from';
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Selecionar período',
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<SelectionStep>(() =>
    resolveInitialStep(value),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setStep(resolveInitialStep(value));
    }
  };

  const selected: DateRange | undefined =
    value.from || value.to
      ? { from: value.from ?? undefined, to: value.to ?? undefined }
      : undefined;

  const label = formatLabel(value);

  function handleSelect(range: DateRange | undefined) {
    const clickedDay = range?.to ?? range?.from ?? null;

    if (!clickedDay) {
      onChange({ from: null, to: null });
      setStep('from');
      return;
    }

    if (step === 'from') {
      onChange({ from: clickedDay, to: null });
      setStep('to');
      return;
    }

    const currentFrom = value.from;

    if (!currentFrom) {
      onChange({ from: clickedDay, to: null });
      setStep('to');
      return;
    }

    if (sameDay(clickedDay, currentFrom)) {
      onChange({ from: currentFrom, to: currentFrom });
    } else if (clickedDay.getTime() < currentFrom.getTime()) {
      onChange({ from: clickedDay, to: currentFrom });
    } else {
      onChange({ from: currentFrom, to: clickedDay });
    }

    setStep('from');
    window.setTimeout(() => setOpen(false), 250);
  }

  function handleClear() {
    onChange({ from: null, to: null });
    setStep('from');
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            'h-10 w-full justify-start gap-2 rounded-xl border-white/10 bg-zinc-900 px-4 text-left text-sm font-normal text-white hover:bg-zinc-800',
            !label && 'text-zinc-500',
          )}
        >
          <CalendarIcon className="h-4 w-4 text-zinc-500" />
          {label ?? placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={8}
        className="w-auto rounded-2xl border-white/10 bg-zinc-950 p-3"
      >
        <p className="mb-2 text-center text-[11px] font-medium uppercase tracking-wide text-zinc-400">
          {step === 'from'
            ? 'Selecione a data de publicação'
            : 'Selecione a data de expiração'}
        </p>

        <Calendar
          mode="range"
          selected={selected}
          onSelect={handleSelect}
          numberOfMonths={1}
          locale={ptBR}
          captionLayout="dropdown"
          disabled={{ before: startOfToday() }}
          className="rounded-xl bg-transparent [--cell-size:--spacing(8)]"
        />

        {(value.from || value.to) && (
          <div className="mt-2 flex justify-end border-t border-white/10 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Limpar
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
