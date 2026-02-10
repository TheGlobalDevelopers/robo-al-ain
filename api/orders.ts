import { promises as fs } from "node:fs";
import path from "node:path";

type ApiRequest = {
  method?: string;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => ApiResponse;
  send: (body: string) => void;
};

const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = "storefront-orders";
const FILE_STORE_PATH = path.join(process.cwd(), ".data", `${KV_KEY}.json`);

const json = (res: ApiResponse, status: number, body: unknown) => {
  res
    .status(status)
    .setHeader("Content-Type", "application/json")
    .setHeader("Cache-Control", "no-store")
    .send(JSON.stringify(body));
};

const getKvHeaders = () => ({
  Authorization: `Bearer ${KV_REST_API_TOKEN}`,
  "Content-Type": "application/json",
});

const parseBody = <T>(raw: unknown): T | null => {
  if (raw && typeof raw === "object") {
    return raw as T;
  }
  if (typeof raw !== "string") {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const ensureFileStoreDir = async () => {
  await fs.mkdir(path.dirname(FILE_STORE_PATH), { recursive: true });
};

const getOrdersFromFile = async (): Promise<unknown[]> => {
  try {
    const raw = await fs.readFile(FILE_STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setOrdersToFile = async (orders: unknown[]) => {
  await ensureFileStoreDir();
  await fs.writeFile(FILE_STORE_PATH, JSON.stringify(orders), "utf-8");
};

const getOrders = async (): Promise<unknown[]> => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return getOrdersFromFile();
  }
  const response = await fetch(`${KV_REST_API_URL}/get/${KV_KEY}`, {
    headers: getKvHeaders(),
  });
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as { result?: unknown };
  if (!data?.result) {
    return [];
  }
  if (Array.isArray(data.result)) {
    return data.result;
  }
  return [];
};

const setOrders = async (orders: unknown[]) => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    await setOrdersToFile(orders);
    return;
  }
  await fetch(`${KV_REST_API_URL}/set/${KV_KEY}`, {
    method: "POST",
    headers: getKvHeaders(),
    body: JSON.stringify(orders),
  });
};

const mergeOrders = (orders: unknown[]): unknown[] => {
  const map = new Map<number, unknown>();
  orders.forEach((order) => {
    if (order && typeof order === "object" && "id" in order) {
      const id = Number((order as { id: number }).id);
      map.set(id, order);
    }
  });
  return Array.from(map.values()).sort((a, b) => {
    const aId = Number((a as { id: number }).id);
    const bId = Number((b as { id: number }).id);
    return bId - aId;
  });
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method === "GET") {
      const orders = await getOrders();
      return json(res, 200, {
        orders,
        storage: KV_REST_API_URL && KV_REST_API_TOKEN ? "kv" : "file",
      });
    }

    if (req.method === "POST") {
      const incoming = parseBody<unknown>(req.body);
      if (!incoming || typeof incoming !== "object") {
        return json(res, 400, { error: "Invalid order payload" });
      }
      const current = await getOrders();
      const merged = mergeOrders([incoming, ...current]);
      await setOrders(merged);
      return json(res, 200, { orders: merged });
    }

    if (req.method === "PUT") {
      const incoming = parseBody<{ orders?: unknown[] }>(req.body);
      const nextOrders = Array.isArray(incoming?.orders) ? incoming.orders : null;
      if (!nextOrders) {
        return json(res, 400, { error: "Invalid orders payload" });
      }
      const merged = mergeOrders(nextOrders);
      await setOrders(merged);
      return json(res, 200, { orders: merged });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to update orders", detail: String(error) });
  }
}
