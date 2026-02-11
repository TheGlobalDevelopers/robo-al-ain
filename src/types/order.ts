export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  customer: string;
  phone: string;
  address: string;
  paymentMethod: "online" | "cod";
  fulfillment: "delivery" | "pickup";
  items: OrderItem[];
  total: number;
  date: string;
  source: "online" | "manual";
  cardHolder?: string;
  cardLast4?: string;
  cardToken?: string;
}
