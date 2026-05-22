function normalizeBeltName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

type BeltStyle = {
  bg: string;
  text: string;
  ring: string;
};

const BELT_STYLE_BY_NAME: Record<string, BeltStyle> = {
  branca: {
    bg: 'bg-[hsl(var(--belt-white))]',
    text: 'text-zinc-900',
    ring: 'ring-zinc-200',
  },
  azul: {
    bg: 'bg-[hsl(var(--belt-blue))]',
    text: 'text-white',
    ring: 'ring-blue-300/30',
  },
  roxa: {
    bg: 'bg-[hsl(var(--belt-purple))]',
    text: 'text-white',
    ring: 'ring-purple-400/30',
  },
  marrom: {
    bg: 'bg-[hsl(var(--belt-brown))]',
    text: 'text-white',
    ring: 'ring-orange-900/40',
  },
  preta: {
    bg: 'bg-[hsl(var(--belt-black))]',
    text: 'text-white',
    ring: 'ring-zinc-700',
  },
  cinza: {
    bg: 'bg-zinc-500',
    text: 'text-white',
    ring: 'ring-zinc-400/30',
  },
  amarela: {
    bg: 'bg-amber-300',
    text: 'text-zinc-900',
    ring: 'ring-amber-200/30',
  },
  laranja: {
    bg: 'bg-orange-500',
    text: 'text-white',
    ring: 'ring-orange-300/30',
  },
  verde: {
    bg: 'bg-emerald-500',
    text: 'text-white',
    ring: 'ring-emerald-300/30',
  },
};

const FALLBACK_STYLE: BeltStyle = {
  bg: 'bg-zinc-700',
  text: 'text-white',
  ring: 'ring-zinc-600',
};

export function getBeltStyle(beltName: string): BeltStyle {
  const normalized = normalizeBeltName(beltName);
  return BELT_STYLE_BY_NAME[normalized] ?? FALLBACK_STYLE;
}

/** Cor hexa aproximada para gráficos e SVGs. */
export function getBeltHex(beltName: string): string {
  const normalized = normalizeBeltName(beltName);
  const map: Record<string, string> = {
    branca: '#f4f4f5',
    azul: '#1e90ff',
    roxa: '#7d2caa',
    marrom: '#6b3411',
    preta: '#18181b',
    cinza: '#71717a',
    amarela: '#fcd34d',
    laranja: '#f97316',
    verde: '#10b981',
  };
  return map[normalized] ?? '#52525b';
}
