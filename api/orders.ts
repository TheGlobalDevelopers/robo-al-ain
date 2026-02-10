const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = "storefront-orders";

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
};

const getKvHeaders = () => ({
  Authorization: `Bearer ${KV_REST_API_TOKEN}`,
  "Content-Type": "application/json",
});

const getOrders = async (): Promise<unknown[]> => {
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

const setOrders = async (orders: unknown[]) => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
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

export default async function handler(req: any, res: any) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return json(res, 501, {
      error: "Vercel KV is not configured.",
      hint: "Set KV_REST_API_URL and KV_REST_API_TOKEN in your Vercel project settings.",
    });
  }

  try {
    if (req.method === "GET") {
      const orders = await getOrders();
      return json(res, 200, { orders });
    }

    if (req.method === "POST") {
      const incoming = req.body;
      const current = await getOrders();
      const merged = mergeOrders([incoming, ...current]);
      await setOrders(merged);
      return json(res, 200, { orders: merged });
    }

    if (req.method === "PUT") {
      const incoming = req.body as { orders?: unknown[] };
      const nextOrders = Array.isArray(incoming?.orders) ? incoming.orders : [];
      const merged = mergeOrders(nextOrders);
      await setOrders(merged);
      return json(res, 200, { orders: merged });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to update orders", detail: String(error) });
  }
}
