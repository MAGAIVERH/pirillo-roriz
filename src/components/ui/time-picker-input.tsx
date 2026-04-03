'use client';

import { useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import {
  buildTime,
  normalizeHour,
  normalizeMinute,
  splitTime,
} from '@/components/ui/time-picker-utils';

type TimePickerInputProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hourPlaceholder?: string;
  minutePlaceholder?: string;
};

export const TimePickerInput = ({
  value,
  onChange,
  disabled,
  hourPlaceholder = 'HH',
  minutePlaceholder = 'MM',
}: TimePickerInputProps) => {
  const initial = splitTime(value);

  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);

  const minuteRef = useRef<HTMLInputElement | null>(null);

  const handleHourChange = (nextValue: string) => {
    const digits = nextValue.replace(/\D/g, '').slice(0, 2);

    setHour(digits);

    if (digits.length === 2) {
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }

    if (digits.length === 2 && minute.length === 2) {
      onChange(buildTime(digits, minute));
    } else {
      onChange('');
    }
  };

  const handleMinuteChange = (nextValue: string) => {
    const digits = nextValue.replace(/\D/g, '').slice(0, 2);

    setMinute(digits);

    if (hour.length === 2 && digits.length === 2) {
      onChange(buildTime(hour, digits));
    } else {
      onChange('');
    }
  };

  const handleHourBlur = () => {
    if (!hour) {
      onChange('');
      return;
    }

    const normalized = normalizeHour(hour);
    setHour(normalized);

    if (normalized.length === 2 && minute.length === 2) {
      onChange(buildTime(normalized, normalizeMinute(minute)));
    }
  };

  const handleMinuteBlur = () => {
    if (!minute) {
      onChange('');
      return;
    }

    const normalized = normalizeMinute(minute);
    setMinute(normalized);

    if (hour.length === 2 && normalized.length === 2) {
      onChange(buildTime(normalizeHour(hour), normalized));
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <Input
        value={hour}
        onChange={(event) => handleHourChange(event.target.value)}
        onBlur={handleHourBlur}
        inputMode='numeric'
        maxLength={2}
        placeholder={hourPlaceholder}
        disabled={disabled}
        className='w-full border-white/10 bg-zinc-950 text-center text-white placeholder:text-zinc-500'
      />

      <span className='text-sm font-semibold text-zinc-400'>:</span>

      <Input
        ref={minuteRef}
        value={minute}
        onChange={(event) => handleMinuteChange(event.target.value)}
        onBlur={handleMinuteBlur}
        inputMode='numeric'
        maxLength={2}
        placeholder={minutePlaceholder}
        disabled={disabled}
        className='w-full border-white/10 bg-zinc-950 text-center text-white placeholder:text-zinc-500'
      />
    </div>
  );
};
