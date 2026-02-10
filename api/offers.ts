const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = "storefront-offers";

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
};

const getKvHeaders = () => ({
  Authorization: `Bearer ${KV_REST_API_TOKEN}`,
  "Content-Type": "application/json",
});

const getOffers = async (): Promise<unknown[]> => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return [];
  const response = await fetch(`${KV_REST_API_URL}/get/${KV_KEY}`, { headers: getKvHeaders() });
  if (!response.ok) return [];
  const data = (await response.json()) as { result?: unknown };
  return Array.isArray(data.result) ? data.result : [];
};

const setOffers = async (offers: unknown[]) => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return;
  await fetch(`${KV_REST_API_URL}/set/${KV_KEY}`, {
    method: "POST",
    headers: getKvHeaders(),
    body: JSON.stringify(offers),
  });
};

const mergeById = (items: unknown[]) => {
  const map = new Map<number, unknown>();
  items.forEach((item) => {
    if (item && typeof item === "object" && "id" in item) {
      map.set(Number((item as { id: number }).id), item);
    }
  });
  return Array.from(map.values()).sort((a, b) => Number((b as { id: number }).id) - Number((a as { id: number }).id));
};

export default async function handler(req: any, res: any) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return json(res, 501, { error: "Vercel KV is not configured." });
  }

  try {
    if (req.method === "GET") {
      return json(res, 200, { offers: await getOffers() });
    }
    if (req.method === "POST") {
      const merged = mergeById([req.body, ...(await getOffers())]);
      await setOffers(merged);
      return json(res, 200, { offers: merged });
    }
    if (req.method === "PUT") {
      const payload = req.body as { offers?: unknown[] };
      const merged = mergeById(Array.isArray(payload?.offers) ? payload.offers : []);
      await setOffers(merged);
      return json(res, 200, { offers: merged });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to update offers", detail: String(error) });
  }
}
