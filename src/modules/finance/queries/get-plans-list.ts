import { getOrCreateDefaultAcademy } from '@/lib/academy';
import { db } from '@/lib/db';

export type PlanRow = {
  id: string;
  name: string;
  description: string | null;
  priceLabel: string;
  billingCycleLabel: string;
  activeSubscriptions: number;
  active: boolean;
};

const billingCycleMap: Record<string, string> = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL: 'Anual',
};

export async function getPlansList(): Promise<PlanRow[]> {
  const academy = await getOrCreateDefaultAcademy();

  const plans = await db.plan.findMany({
    where: { academyId: academy.id },
    include: {
      _count: {
        select: {
          subscriptions: {
            where: { status: 'ACTIVE' },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    description: plan.description,
    priceLabel: (plan.priceInCents / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }),
    billingCycleLabel: billingCycleMap[plan.billingCycle] ?? plan.billingCycle,
    activeSubscriptions: plan._count.subscriptions,
    active: plan.active,
  }));
}
