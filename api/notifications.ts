import { hasAnyStorage, readCollection, writeCollection } from "./_storage.js";

const KV_KEY = "storefront-notifications";

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
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
  if (!hasAnyStorage()) return json(res, 501, { error: "No storage configured." });
  try {
    if (req.method === "GET") return json(res, 200, { notifications: await readCollection(KV_KEY) });
    if (req.method === "PUT") {
      const payload = req.body as { notifications?: unknown[] };
      const merged = mergeById(Array.isArray(payload?.notifications) ? payload.notifications : []);
      await writeCollection(KV_KEY, merged);
      return json(res, 200, { notifications: merged });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to update notifications", detail: String(error) });
  }
}
