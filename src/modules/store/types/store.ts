export type StoreVisibility = 'todos' | 'alunos' | 'professores';

export type StoreReservationStatus = 'pending' | 'fulfilled' | 'expired';

export type ReservationUserType = 'aluno' | 'professor';

export type StorePendingReserver = {
  orderId: string;
  name: string;
  userType: ReservationUserType;
  reservedAt: Date;
  expiresAt: Date;
};

export type StoreProduct = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  imageUrl: string | null;
  imageUrls: string[];
  visibility: StoreVisibility;
  active: boolean;
  pendingReservers: StorePendingReserver[];
  createdAt: Date;
  updatedAt: Date;
};

export type StoreReservation = {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userType: ReservationUserType;
  status: StoreReservationStatus;
  quantity: number;
  createdAt: Date;
  expiresAt: Date;
};

export type StoreOverviewStats = {
  totalProducts: number;
  totalStock: number;
  pendingReservations: number;
  outOfStock: number;
};
