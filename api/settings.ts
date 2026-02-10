const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const KV_KEY = "storefront-settings";

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
};

const getKvHeaders = () => ({ Authorization: `Bearer ${KV_REST_API_TOKEN}`, "Content-Type": "application/json" });

const getSettings = async (): Promise<unknown> => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return null;
  const response = await fetch(`${KV_REST_API_URL}/get/${KV_KEY}`, { headers: getKvHeaders() });
  if (!response.ok) return null;
  const data = (await response.json()) as { result?: unknown };
  return data.result ?? null;
};

const setSettings = async (settings: unknown) => {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) return;
  await fetch(`${KV_REST_API_URL}/set/${KV_KEY}`, {
    method: "POST",
    headers: getKvHeaders(),
    body: JSON.stringify(settings),
  });
};

export default async function handler(req: any, res: any) {
  if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
    return json(res, 501, { error: "Vercel KV is not configured." });
  }

  try {
    if (req.method === "GET") {
      return json(res, 200, { settings: await getSettings() });
    }
    if (req.method === "PUT") {
      const payload = req.body as { settings?: unknown };
      await setSettings(payload?.settings ?? {});
      return json(res, 200, { settings: payload?.settings ?? {} });
    }
    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to update settings", detail: String(error) });
  }
}
