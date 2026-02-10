export interface AdminNotification {
  id: number;
  message: string;
  type: "order" | "product" | "offer" | "system";
  createdAt: string;
  read: boolean;
}
