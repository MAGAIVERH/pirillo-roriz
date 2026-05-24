'use client';

import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type DateInputProps = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  defaultMonth?: Date;
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
};

function applyMask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);

  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function parseInput(
  text: string,
  minDate?: Date,
  maxDate?: Date,
): Date | undefined {
  if (text.length !== 10) return undefined;

  const parsed = parse(text, 'dd/MM/yyyy', new Date());
  if (!isValid(parsed)) return undefined;

  if (minDate && parsed < minDate) return undefined;
  if (maxDate && parsed > maxDate) return undefined;

  return parsed;
}

/**
 * Input de data com máscara dd/mm/aaaa e popover do calendário como atalho.
 *
 * - Usuário pode digitar a data diretamente, sem clicar em nada.
 * - O ícone de calendário abre o Calendar do shadcn para casos onde o
 *   usuário prefere navegação visual.
 * - Aceita range mínimo/máximo opcional (default: 1900 até hoje).
 */
export function DateInput({
  value,
  onChange,
  placeholder = 'dd/mm/aaaa',
  minDate,
  maxDate,
  defaultMonth,
  className,
  ariaLabel,
  disabled,
  invalid,
  id,
}: DateInputProps) {
  const formattedValue = value ? format(value, 'dd/MM/yyyy') : '';
  const [text, setText] = useState(formattedValue);
  const [lastSyncedValue, setLastSyncedValue] = useState(formattedValue);

  if (formattedValue !== lastSyncedValue) {
    setLastSyncedValue(formattedValue);
    setText(formattedValue);
  }

  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const masked = applyMask(event.target.value);
    setText(masked);

    if (masked.length === 10) {
      const parsed = parseInput(masked, minDate, maxDate);
      if (parsed) {
        onChange(parsed);
        return;
      }
    }

    onChange(undefined);
  };

  const handleBlur = () => {
    if (text.length > 0 && text.length < 10) {
      setText(value ? format(value, 'dd/MM/yyyy') : '');
    }
  };

  return (
    <div className={cn('relative flex w-full', className)}>
      <Input
        id={id}
        value={text}
        onChange={handleTextChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        inputMode='numeric'
        maxLength={10}
        disabled={disabled}
        aria-invalid={invalid}
        aria-label={ariaLabel}
        className='border-white/10 bg-zinc-900 pr-11 text-white placeholder:text-zinc-500'
      />

      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            type='button'
            variant='ghost'
            disabled={disabled}
            aria-label='Abrir calendário'
            className='absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-md p-0 text-zinc-400 hover:bg-zinc-800 hover:text-white'
          >
            <CalendarIcon className='h-4 w-4' />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align='end'
          className='z-50 w-auto border-white/10 bg-zinc-950 p-0 text-white'
          onInteractOutside={(event) => {
            // Cliques nos dropdowns de mês/ano (portais aninhados do
            // Select) não devem fechar o popover do calendário.
            const target = event.target as HTMLElement | null;
            if (
              target?.closest('[data-slot="select-content"]') ||
              target?.closest('[data-slot="select-item"]')
            ) {
              event.preventDefault();
            }
          }}
        >
          <Calendar
            mode='single'
            selected={value}
            onSelect={(date) => {
              onChange(date);
              setPopoverOpen(false);
            }}
            captionLayout='dropdown'
            startMonth={minDate ?? new Date(1900, 0)}
            endMonth={maxDate ?? new Date()}
            defaultMonth={value ?? defaultMonth ?? new Date(1995, 0)}
            disabled={(day) =>
              Boolean(minDate && day < minDate) ||
              Boolean(maxDate && day > maxDate)
            }
            locale={ptBR}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
