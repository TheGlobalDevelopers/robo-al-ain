import { Subscriber } from "@/types/subscriber";

const STORAGE_KEY = "storefront-subscribers";
const API_URL = import.meta.env.VITE_SUBSCRIBERS_API_URL?.trim() || "/api/subscribers";

type ApiResponse = { subscribers?: Subscriber[] };

const readLocal = () => {
  if (typeof window === "undefined") return [] as Subscriber[];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as Subscriber[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (subscribers: Subscriber[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subscribers));
  }
};

const mergeSubscribers = (items: Subscriber[]) => {
  const map = new Map<string, Subscriber>();
  items.forEach((item) => map.set(item.email.toLowerCase(), item));
  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

export const loadSubscribers = async () => {
  const local = readLocal();
  if (!API_URL) return local;
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) return local;
    const data = (await response.json()) as ApiResponse | Subscriber[];
    const remote = Array.isArray(data) ? data : (Array.isArray(data.subscribers) ? data.subscribers : []);
    const merged = mergeSubscribers([...remote, ...local]);
    writeLocal(merged);
    return merged;
  } catch {
    return local;
  }
};

export const saveSubscribers = async (subscribers: Subscriber[]) => {
  writeLocal(subscribers);
  if (!API_URL) return;
  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscribers }),
    });
  } catch {
    // local fallback already saved
  }
};

export const subscribeEmail = async (email: string) => {
  const next: Subscriber = { id: Date.now(), email, createdAt: new Date().toLocaleString() };
  const merged = mergeSubscribers([next, ...readLocal()]);
  writeLocal(merged);
  if (!API_URL) return merged;
  try {
    await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
  } catch {
    // local fallback already saved
  }
  return merged;
};
