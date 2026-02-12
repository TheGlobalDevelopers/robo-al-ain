import { hasAnyStorage, readCollection, writeCollection } from "./_storage.js";

const KV_KEY = "storefront-session";

type SessionRecord = {
  deviceId: string;
  currentAccountId: number | null;
  updatedAt: string;
  ip: string | null;
  userAgent: string;
};

const json = (res: any, status: number, body: unknown) => {
  res.status(status).setHeader("Content-Type", "application/json").send(JSON.stringify(body));
};

const normalizeSession = (value: unknown, fallbackDeviceId: string): SessionRecord => {
  if (!value || typeof value !== "object") {
    return { deviceId: fallbackDeviceId, currentAccountId: null, updatedAt: new Date().toISOString(), ip: null, userAgent: "" };
  }
  const entry = value as { deviceId?: unknown; currentAccountId?: unknown; updatedAt?: unknown; ip?: unknown; userAgent?: unknown };
  const accountId = Number(entry.currentAccountId);
  return {
    deviceId: typeof entry.deviceId === "string" && entry.deviceId.trim() ? entry.deviceId : fallbackDeviceId,
    currentAccountId: Number.isFinite(accountId) ? accountId : null,
    updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date().toISOString(),
    ip: typeof entry.ip === "string" ? entry.ip : null,
    userAgent: typeof entry.userAgent === "string" ? entry.userAgent : "",
  };
};

export default async function handler(req: any, res: any) {
  if (!hasAnyStorage()) {
    return json(res, 501, { error: "No storage configured." });
  }

  try {
    if (req.method === "GET") {
      const rows = await readCollection(KV_KEY);
      const deviceId = typeof req.query?.deviceId === "string" ? req.query.deviceId.trim() : "";
      if (!deviceId) {
        return json(res, 400, { error: "deviceId query parameter is required" });
      }
      const record = rows.find((row) => normalizeSession(row, deviceId).deviceId === deviceId);
      return json(res, 200, { session: normalizeSession(record, deviceId) });
    }

    if (req.method === "PUT") {
      const deviceId = String(req.body?.deviceId ?? "").trim();
      if (!deviceId) {
        return json(res, 400, { error: "deviceId is required" });
      }
      const rows = await readCollection(KV_KEY);
      const accountId = Number(req.body?.currentAccountId);
      const session: SessionRecord = {
        deviceId,
        currentAccountId: Number.isFinite(accountId) ? accountId : null,
        updatedAt: new Date().toISOString(),
        ip: typeof req.headers?.["x-forwarded-for"] === "string" ? req.headers["x-forwarded-for"].split(",")[0]?.trim() || null : null,
        userAgent: typeof req.headers?.["user-agent"] === "string" ? req.headers["user-agent"] : "",
      };
      const nextRows = [
        session,
        ...rows
          .map((row) => normalizeSession(row, ""))
          .filter((row) => row.deviceId && row.deviceId !== deviceId),
      ].slice(0, 500);
      await writeCollection(KV_KEY, nextRows);
      return json(res, 200, { session });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    return json(res, 500, { error: "Failed to sync session", detail: String(error) });
  }
}
