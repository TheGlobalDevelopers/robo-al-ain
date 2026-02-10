import { Order } from "@/types/order";

const ORDER_STORAGE_KEY = "storefront-orders";
const ORDER_API_URL = import.meta.env.VITE_ORDERS_API_URL?.trim() || "/api/orders";

type OrdersApiResponse = {
  orders?: Order[];
};

const parseOrders = (value: string | null): Order[] => {
  if (!value) {
    return [];
  }
  try {
    const parsed = JSON.parse(value) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readStoredOrders = (): Order[] => {
  if (typeof window === "undefined") {
    return [];
  }
  return parseOrders(localStorage.getItem(ORDER_STORAGE_KEY));
};

const writeStoredOrders = (orders: Order[]) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
};

export const hasRemoteOrdersApi = () => Boolean(ORDER_API_URL);

export const mergeOrders = (orders: Order[]): Order[] => {
  const map = new Map<number, Order>();
  orders.forEach((order) => {
    map.set(order.id, order);
  });
  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

const parseOrdersResponse = (data: Order[] | OrdersApiResponse): Order[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.orders)) {
    return data.orders;
  }
  return [];
};

const fetchRemoteOrders = async (): Promise<Order[]> => {
  if (!ORDER_API_URL) {
    return [];
  }
  try {
    const response = await fetch(ORDER_API_URL, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as Order[] | OrdersApiResponse;
    return parseOrdersResponse(data);
  } catch {
    return [];
  }
};

export const loadOrders = async (): Promise<Order[]> => {
  const localOrders = readStoredOrders();
  if (!ORDER_API_URL) {
    return localOrders;
  }
  const remoteOrders = await fetchRemoteOrders();
  if (!remoteOrders.length) {
    return localOrders;
  }
  const merged = mergeOrders([...localOrders, ...remoteOrders]);
  writeStoredOrders(merged);
  return merged;
};

export const saveOrders = async (orders: Order[]) => {
  writeStoredOrders(orders);
  if (!ORDER_API_URL) {
    return;
  }
  try {
    await fetch(ORDER_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders }),
    });
  } catch {
    // Ignore network errors; local storage already updated.
  }
};

export const pushOrder = async (order: Order): Promise<Order[]> => {
  const nextOrders = mergeOrders([order, ...readStoredOrders()]);
  writeStoredOrders(nextOrders);
  if (!ORDER_API_URL) {
    return nextOrders;
  }
  try {
    const response = await fetch(ORDER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!response.ok) {
      return nextOrders;
    }
    const data = (await response.json()) as Order[] | OrdersApiResponse;
    const remoteOrders = parseOrdersResponse(data);
    if (!remoteOrders.length) {
      return nextOrders;
    }
    const merged = mergeOrders([...remoteOrders, ...nextOrders]);
    writeStoredOrders(merged);
    return merged;
  } catch {
    return nextOrders;
  }
};
