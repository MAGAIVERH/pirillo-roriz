import type {
  AnnouncementScope,
  AnnouncementType,
} from '@/generated/prisma/client';

import type {
  WarningStatus,
  WarningType,
  WarningVisibility,
} from '../types/warnings';

export function scopeToVisibility(
  scope: AnnouncementScope,
): WarningVisibility {
  switch (scope) {
    case 'STUDENTS':
      return 'alunos';
    case 'INSTRUCTORS':
      return 'professores';
    default:
      return 'todos';
  }
}

export function visibilityToScope(
  visibility: WarningVisibility,
): AnnouncementScope {
  switch (visibility) {
    case 'alunos':
      return 'STUDENTS';
    case 'professores':
      return 'INSTRUCTORS';
    default:
      return 'ALL';
  }
}

export function typeToWarningType(type: AnnouncementType): WarningType {
  switch (type) {
    case 'WARNING':
      return 'aviso';
    case 'IMPORTANT':
      return 'importante';
    default:
      return 'info';
  }
}

export function warningTypeToPrisma(type: WarningType): AnnouncementType {
  switch (type) {
    case 'aviso':
      return 'WARNING';
    case 'importante':
      return 'IMPORTANT';
    default:
      return 'INFO';
  }
}

export function computeWarningStatus(
  publishedAt: Date | null,
  expiresAt: Date | null,
  now = new Date(),
): WarningStatus {
  if (!publishedAt) {
    return 'rascunho';
  }

  if (publishedAt > now) {
    return 'agendado';
  }

  if (expiresAt && expiresAt < now) {
    return 'expirado';
  }

  return 'ativo';
}
