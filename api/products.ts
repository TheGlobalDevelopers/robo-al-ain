const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = "storefront-products";

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
};

const getKvHeaders = () => ({
  Authorization: `Bearer ${KV_REST_API_TOKEN}`,
  "Content-Type": "application/json",
});

const getProducts = async (): Promise<unknown[]> => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return [];
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

export default async function handler(req: any, res: any) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return json(res, 501, {
      error: "Vercel KV is not configured.",
      hint: "Set KV_REST_API_URL and KV_REST_API_TOKEN in your Vercel project settings.",
    });
  }

  try {
    if (req.method === "GET") {
      const products = await getProducts();
      return json(res, 200, { products });
    }

    if (req.method === "POST") {
      const incoming = req.body;
      const current = await getProducts();
      const merged = mergeProducts([incoming, ...current]);
      await setProducts(merged);
      return json(res, 200, { products: merged });
    }

    if (req.method === "PUT") {
      const incoming = req.body as { products?: unknown[] };
      const nextProducts = Array.isArray(incoming?.products) ? incoming.products : [];
      const merged = mergeProducts(nextProducts);
      await setProducts(merged);
      return json(res, 200, { products: merged });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to update products", detail: String(error) });
  }
}
