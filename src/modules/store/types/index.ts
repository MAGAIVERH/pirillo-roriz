export type StoreVisibility = 'todos' | 'alunos' | 'professores';

export type ReservationStatus = 'pending' | 'confirmed';

export type ReservationUserType = 'aluno' | 'professor';

export interface StoreProduct {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  qty: number;
  reserved: number;
  imageUrl: string | null;
  visibility: StoreVisibility;
  createdAt: Date;
  updatedAt: Date;
}

export interface StoreReservation {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userType: ReservationUserType;
  status: ReservationStatus;
  createdAt: Date;
}

export interface StoreOverviewStats {
  totalProducts: number;
  totalStock: number;
  pendingReservations: number;
  outOfStock: number;
}
