import { hasAnyStorage, readCollection, writeCollection } from "./_storage.js";

const KV_KEY = "storefront-settings";

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
};

export default async function handler(req: any, res: any) {
  if (!hasAnyStorage()) return json(res, 501, { error: "No storage configured." });

  try {
    if (req.method === "GET") {
      const [settings] = await readCollection(KV_KEY);
      return json(res, 200, { settings: settings ?? null });
    }
    if (req.method === "PUT") {
      const payload = req.body as { settings?: unknown };
      const next = payload?.settings ?? {};
      await writeCollection(KV_KEY, [next]);
      return json(res, 200, { settings: next });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to update settings", detail: String(error) });
  }
}
