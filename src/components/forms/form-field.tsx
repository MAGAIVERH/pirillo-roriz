import type { ReactNode } from 'react';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type FormFieldProps = {
  label: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  className,
  labelClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <Label
        htmlFor={htmlFor}
        className={cn(
          'text-xs font-medium tracking-wide text-zinc-400',
          labelClassName,
        )}
      >
        {label}
      </Label>

      {children}

      {hint || error ? (
        <div className='space-y-0.5'>
          {hint ? (
            <p className='text-xs leading-4 text-zinc-500'>{hint}</p>
          ) : null}
          {error ? (
            <p className='text-xs leading-4 text-red-400'>{error}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export const formGridClassName =
  'grid grid-cols-1 items-start gap-x-5 gap-y-4 md:grid-cols-2';

export const formInputClassName =
  'h-9 border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500';

export const formSelectTriggerClassName =
  'h-9 w-full border-white/10 bg-zinc-900 text-white';

export const formSelectContentClassName =
  'z-50 min-w-[var(--radix-select-trigger-width)] border-white/10 bg-zinc-950 text-white';

export const formCardClassName = 'gap-3 border-white/10 bg-zinc-950 text-white';

export const formCardHeaderClassName = 'pb-1';

export const formCardContentClassName = 'pt-0';
