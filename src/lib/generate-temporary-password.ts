import { randomBytes } from 'node:crypto';

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*';

const POOL = UPPER + LOWER + DIGITS + SYMBOLS;

function pickFrom(source: string): string {
  const bytes = randomBytes(1);
  return source[bytes[0] % source.length];
}

/**
 * Gera uma senha provisória de 10 caracteres garantindo pelo menos
 * uma maiúscula, uma minúscula, um dígito e um símbolo seguro.
 * Caracteres ambíguos (0/O/1/l/I) são omitidos para reduzir erros de digitação.
 */
export function generateTemporaryPassword(): string {
  const required = [
    pickFrom(UPPER),
    pickFrom(LOWER),
    pickFrom(DIGITS),
    pickFrom(SYMBOLS),
  ];

  while (required.length < 10) {
    required.push(pickFrom(POOL));
  }

  // Fisher-Yates simples com entropia do crypto
  for (let i = required.length - 1; i > 0; i -= 1) {
    const j = randomBytes(1)[0] % (i + 1);
    [required[i], required[j]] = [required[j], required[i]];
  }

  return required.join('');
}
