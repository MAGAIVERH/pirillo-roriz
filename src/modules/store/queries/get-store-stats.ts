// src/modules/store/queries/get-store-stats.ts
//
// Quando o banco estiver pronto, substituir os mocks pelas queries reais
// (igual ao padrão do módulo finance — get-finance-stats.ts).

import type { StoreOverviewStats, StoreProduct, StoreReservation } from '../types';
import { MOCK_PRODUCTS, MOCK_RESERVATIONS } from '../data/mock-store-data';

// ── Produtos ──────────────────────────────────────────────────────────────────

export async function getStoreProducts(): Promise<StoreProduct[]> {
  // TODO: substituir por query Prisma
  // return await prisma.storeProduct.findMany({ orderBy: { createdAt: 'desc' } });
  return MOCK_PRODUCTS;
}

// ── Reservas ──────────────────────────────────────────────────────────────────

export async function getStoreReservations(): Promise<StoreReservation[]> {
  // TODO: substituir por query Prisma
  // return await prisma.storeReservation.findMany({
  //   include: { product: true, user: true },
  //   orderBy: { createdAt: 'desc' },
  // });
  return MOCK_RESERVATIONS;
}

// ── Stats para os cards de métricas ──────────────────────────────────────────

export async function getStoreOverviewStats(): Promise<StoreOverviewStats> {
  const [products, reservations] = await Promise.all([
    getStoreProducts(),
    getStoreReservations(),
  ]);

  return {
    totalProducts: products.length,
    totalStock: products.reduce((acc, p) => acc + p.qty, 0),
    pendingReservations: reservations.filter(r => r.status === 'pending').length,
    outOfStock: products.filter(p => p.qty - p.reserved <= 0).length,
  };
}
