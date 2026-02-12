import { AdminNotification } from "@/types/notification";

const STORAGE_KEY = "storefront-notifications";
const API_URL = import.meta.env.VITE_NOTIFICATIONS_API_URL?.trim() || "/api/notifications";

type ApiResponse = { notifications?: AdminNotification[] };

const parse = (value: string | null): AdminNotification[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as AdminNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readLocal = () => (typeof window === "undefined" ? [] : parse(localStorage.getItem(STORAGE_KEY)));

const writeLocal = (notifications: AdminNotification[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }
};

export const hasRemoteNotificationsApi = () => Boolean(API_URL);

export const mergeNotifications = (notifications: AdminNotification[]) => {
  const map = new Map<number, AdminNotification>();
  notifications.forEach((item) => map.set(item.id, item));
  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

const parseResponse = (data: AdminNotification[] | ApiResponse) => {
  if (Array.isArray(data)) return data;
  return Array.isArray(data.notifications) ? data.notifications : [];
};

export const loadNotifications = async () => {
  const local = readLocal();
  if (!API_URL) return local;
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) return local;
    const remote = parseResponse((await response.json()) as AdminNotification[] | ApiResponse);
    if (!remote.length) return local;
    const merged = mergeNotifications([...local, ...remote]);
    writeLocal(merged);
    return merged;
  } catch {
    return local;
  }
};

export const saveNotifications = async (notifications: AdminNotification[]) => {
  writeLocal(notifications);
  if (!API_URL) return;
  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifications }),
    });
  } catch {
    // local fallback already saved
  }
};
