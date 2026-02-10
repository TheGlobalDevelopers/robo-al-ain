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
const KV_KEY = "storefront-products";
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

const getProductsFromFile = async (): Promise<unknown[]> => {
  try {
    const raw = await fs.readFile(FILE_STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setProductsToFile = async (products: unknown[]) => {
  await ensureFileStoreDir();
  await fs.writeFile(FILE_STORE_PATH, JSON.stringify(products), "utf-8");
};

const getProducts = async (): Promise<unknown[]> => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return getProductsFromFile();
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

const setProducts = async (products: unknown[]) => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    await setProductsToFile(products);
    return;
  }
  await fetch(`${KV_REST_API_URL}/set/${KV_KEY}`, {
    method: "POST",
    headers: getKvHeaders(),
    body: JSON.stringify(products),
  });
};

const mergeProducts = (products: unknown[]): unknown[] => {
  const map = new Map<number, unknown>();
  products.forEach((product) => {
    if (product && typeof product === "object" && "id" in product) {
      const id = Number((product as { id: number }).id);
      map.set(id, product);
    }
  });
  return Array.from(map.values()).sort((a, b) => {
    const aId = Number((a as { id: number }).id);
    const bId = Number((b as { id: number }).id);
    return aId - bId;
  });
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method === "GET") {
      const products = await getProducts();
      return json(res, 200, {
        products,
        storage: KV_REST_API_URL && KV_REST_API_TOKEN ? "kv" : "file",
      });
    }

    if (req.method === "POST") {
      const incoming = parseBody<unknown>(req.body);
      if (!incoming || typeof incoming !== "object") {
        return json(res, 400, { error: "Invalid product payload" });
      }
      const current = await getProducts();
      const merged = mergeProducts([incoming, ...current]);
      await setProducts(merged);
      return json(res, 200, { products: merged });
    }

    if (req.method === "PUT") {
      const incoming = parseBody<{ products?: unknown[] }>(req.body);
      const nextProducts = Array.isArray(incoming?.products) ? incoming.products : null;
      if (!nextProducts) {
        return json(res, 400, { error: "Invalid products payload" });
      }
      const merged = mergeProducts(nextProducts);
      await setProducts(merged);
      return json(res, 200, { products: merged });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to update products", detail: String(error) });
  }
}
