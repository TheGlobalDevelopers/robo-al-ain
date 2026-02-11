export interface AccountPermissions {
  canViewOrders: boolean;
  canViewProfits: boolean;
  canViewCards: boolean;
  canManageProducts: boolean;
  canManageOffers: boolean;
  canManageUsers: boolean;
}

export interface SavedCard {
  id: number;
  holder: string;
  last4: string;
  brand: string;
  addedAt: string;
}

export interface PaymentHistoryItem {
  orderId: number;
  total: number;
  date: string;
  method: "online" | "cod";
  status: "paid" | "pending";
}

export interface UserAccount {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  verified: boolean;
  verificationMethod: "sms" | "skipped";
  createdAt: string;
  permissions: AccountPermissions;
  paymentHistory: PaymentHistoryItem[];
  savedCards: SavedCard[];
}

export const customerPermissions: AccountPermissions = {
  canViewOrders: true,
  canViewProfits: false,
  canViewCards: true,
  canManageProducts: false,
  canManageOffers: false,
  canManageUsers: false,
};

export const fullAdminPermissions: AccountPermissions = {
  canViewOrders: true,
  canViewProfits: true,
  canViewCards: true,
  canManageProducts: true,
  canManageOffers: true,
  canManageUsers: true,
};
