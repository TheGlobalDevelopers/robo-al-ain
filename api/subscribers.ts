import { hasAnyStorage, readCollection, writeCollection } from "./_storage.js";

const KV_KEY = "storefront-subscribers";

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
};

const mergeByEmail = (items: unknown[]) => {
  const map = new Map<string, unknown>();
  items.forEach((item) => {
    if (item && typeof item === "object" && "email" in item) {
      map.set(String((item as { email: string }).email).toLowerCase(), item);
    }
  });
  return Array.from(map.values());
};

export default async function handler(req: any, res: any) {
  if (!hasAnyStorage()) return json(res, 501, { error: "No storage configured." });
  try {
    if (req.method === "GET") return json(res, 200, { subscribers: await readCollection(KV_KEY) });
    if (req.method === "POST") {
      const merged = mergeByEmail([req.body, ...(await readCollection(KV_KEY))]);
      await writeCollection(KV_KEY, merged);
      return json(res, 200, { subscribers: merged });
    }
    if (req.method === "PUT") {
      const payload = req.body as { subscribers?: unknown[] };
      const merged = mergeByEmail(Array.isArray(payload?.subscribers) ? payload.subscribers : []);
      await writeCollection(KV_KEY, merged);
      return json(res, 200, { subscribers: merged });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to update subscribers", detail: String(error) });
  }
}
