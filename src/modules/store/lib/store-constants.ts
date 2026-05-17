/** Reservas não retiradas em até este prazo voltam ao estoque automaticamente. */
export const STORE_RESERVATION_EXPIRY_DAYS = 2;

export const STORE_RESERVATION_EXPIRY_MS =
  STORE_RESERVATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

export const DEFAULT_STORE_CATEGORY_NAME = 'Geral';
export const DEFAULT_STORE_CATEGORY_SLUG = 'geral';
