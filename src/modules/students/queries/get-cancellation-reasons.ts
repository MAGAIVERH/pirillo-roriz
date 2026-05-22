import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type CancellationReasonOption = {
  id: string;
  name: string;
};

export async function getCancellationReasons(): Promise<
  CancellationReasonOption[]
> {
  const academy = await getOrCreateDefaultAcademy();

  return db.cancellationReason.findMany({
    where: { academyId: academy.id, active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });
}
