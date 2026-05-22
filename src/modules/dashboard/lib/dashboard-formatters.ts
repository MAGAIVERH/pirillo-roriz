export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

export function formatBeltLabel(
  belt: string,
  degree: number | null,
): string {
  return degree ? `${belt} · ${degree}º grau` : belt;
}
