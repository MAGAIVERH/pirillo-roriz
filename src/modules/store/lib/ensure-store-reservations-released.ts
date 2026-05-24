import { getOrCreateDefaultAcademy } from '@/lib/academy';

import { releaseExpiredReservations } from './release-expired-reservations';

export async function ensureStoreReservationsReleased(): Promise<void> {
  const academy = await getOrCreateDefaultAcademy();
  await releaseExpiredReservations(academy.id);
}
