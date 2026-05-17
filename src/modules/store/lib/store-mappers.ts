import type { ProductAudience } from '@/generated/prisma/client';

import type { StoreVisibility } from '../types/store';
import { STORE_RESERVATION_EXPIRY_MS } from './store-constants';

export function toProductSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function audienceToVisibility(
  audience: ProductAudience,
): StoreVisibility {
  switch (audience) {
    case 'STUDENTS':
      return 'alunos';
    case 'INSTRUCTORS':
      return 'professores';
    default:
      return 'todos';
  }
}

export function visibilityToAudience(
  visibility: StoreVisibility,
): ProductAudience {
  switch (visibility) {
    case 'alunos':
      return 'STUDENTS';
    case 'professores':
      return 'INSTRUCTORS';
    default:
      return 'ALL';
  }
}

export function getReservationExpiryDate(createdAt: Date): Date {
  return new Date(createdAt.getTime() + STORE_RESERVATION_EXPIRY_MS);
}
