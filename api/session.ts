import { hasAnyStorage, readCollection, writeCollection } from "./_storage.js";

const KV_KEY = "storefront-session";

type SessionRecord = {
  currentAccountId: number | null;
  updatedAt: string;
};

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
};

const normalizeSession = (value: unknown): SessionRecord => {
  if (!value || typeof value !== "object") {
    return { currentAccountId: null, updatedAt: new Date().toISOString() };
  }
  const entry = value as { currentAccountId?: unknown; updatedAt?: unknown };
  const accountId = Number(entry.currentAccountId);
  return {
    currentAccountId: Number.isFinite(accountId) ? accountId : null,
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
  };
};

export default async function handler(req: any, res: any) {
  if (!hasAnyStorage()) {
    return json(res, 501, { error: "No storage configured." });
  }

  try {
    if (req.method === "GET") {
      const rows = await readCollection(KV_KEY);
      return json(res, 200, { session: normalizeSession(rows[0]) });
    }

    if (req.method === "PUT") {
      const accountId = Number(req.body?.currentAccountId);
      const session: SessionRecord = {
        currentAccountId: Number.isFinite(accountId) ? accountId : null,
        updatedAt: new Date().toISOString(),
      };
      await writeCollection(KV_KEY, [session]);
      return json(res, 200, { session });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to sync session", detail: String(error) });
  }
}
