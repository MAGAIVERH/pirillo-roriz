/**
 * Espelho seguro do enum `StudentStatus` do Prisma para uso em Client
 * Components. Importar diretamente de `@/generated/prisma/client` arrasta
 * o runtime do Prisma para o bundle do browser e quebra o build.
 *
 * As strings aqui DEVEM bater exatamente com os valores do enum no schema
 * Prisma — qualquer mudança no schema deve ser refletida aqui.
 */
export const STUDENT_STATUSES = [
  'LEAD',
  'TRIAL',
  'ACTIVE',
  'INACTIVE',
  'FROZEN',
  'CANCELED',
  'DELINQUENT',
] as const;

export type StudentStatus = (typeof STUDENT_STATUSES)[number];
