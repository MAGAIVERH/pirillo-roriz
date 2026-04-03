export const TIME_PICKER_SEPARATOR = ':';

export const padTime = (value: string | number) => {
  return String(value).padStart(2, '0');
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const isValidHour = (value: string) => {
  if (!/^\d{2}$/.test(value)) {
    return false;
  }

  const hour = Number(value);
  return hour >= 0 && hour <= 23;
};

export const isValidMinute = (value: string) => {
  if (!/^\d{2}$/.test(value)) {
    return false;
  }

  const minute = Number(value);
  return minute >= 0 && minute <= 59;
};

export const normalizeHour = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 2);

  if (!digits) {
    return '';
  }

  return padTime(clamp(Number(digits), 0, 23));
};

export const normalizeMinute = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 2);

  if (!digits) {
    return '';
  }

  return padTime(clamp(Number(digits), 0, 59));
};

export const splitTime = (value: string) => {
  if (!value || !value.includes(TIME_PICKER_SEPARATOR)) {
    return {
      hour: '',
      minute: '',
    };
  }

  const [hour = '', minute = ''] = value.split(TIME_PICKER_SEPARATOR);

  return {
    hour,
    minute,
  };
};

export const buildTime = (hour: string, minute: string) => {
  if (!hour || !minute) {
    return '';
  }

  return `${hour}${TIME_PICKER_SEPARATOR}${minute}`;
};
