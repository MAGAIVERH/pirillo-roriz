'use server';

// src/modules/store/actions/store-actions.ts

import { revalidatePath } from 'next/cache';
import { StoreProductInput, storeProductSchema } from '../schema/store-product-schema';


// ── Criar produto ─────────────────────────────────────────────────────────────

export async function createStoreProduct(input: StoreProductInput) {
  const parsed = storeProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  // TODO: substituir por insert Prisma
  // await prisma.storeProduct.create({ data: parsed.data });

  revalidatePath('/admin/loja');
  return { success: true };
}

// ── Editar produto ────────────────────────────────────────────────────────────

export async function updateStoreProduct(id: string, input: StoreProductInput) {
  const parsed = storeProductSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.flatten().fieldErrors };
  }

  // TODO: substituir por update Prisma
  // await prisma.storeProduct.update({ where: { id }, data: parsed.data });

  revalidatePath('/admin/loja');
  return { success: true };
}

// ── Deletar produto ───────────────────────────────────────────────────────────

export async function deleteStoreProduct(id: string) {
  // TODO: substituir por delete Prisma
  // await prisma.storeProduct.delete({ where: { id } });

  revalidatePath('/admin/loja');
  return { success: true };
}

// ── Confirmar reserva ─────────────────────────────────────────────────────────

export async function confirmStoreReservation(reservationId: string) {
  // TODO: substituir por update Prisma
  // await prisma.storeReservation.update({
  //   where: { id: reservationId },
  //   data: { status: 'confirmed' },
  // });

  revalidatePath('/admin/loja');
  return { success: true };
}

// ── Reservar produto (chamado pela tela do aluno/professor) ───────────────────

export async function createStoreReservation(productId: string, userId: string) {
  // Decrementa disponibilidade em tempo real
  // TODO: usar transação Prisma para garantir atomicidade
  // await prisma.$transaction([
  //   prisma.storeProduct.update({
  //     where: { id: productId },
  //     data: { reserved: { increment: 1 } },
  //   }),
  //   prisma.storeReservation.create({
  //     data: { productId, userId, status: 'pending' },
  //   }),
  // ]);

  revalidatePath('/admin/loja');
  return { success: true };
}
