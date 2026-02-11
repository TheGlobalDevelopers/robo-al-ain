const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_KV_TABLE = process.env.SUPABASE_KV_TABLE || "app_kv";

const hasVercelKv = () => Boolean(KV_REST_API_URL && KV_REST_API_TOKEN);
const hasSupabaseKv = () => Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const getVercelHeaders = () => ({
  Authorization: `Bearer ${KV_REST_API_TOKEN}`,
  "Content-Type": "application/json",
});

const getSupabaseHeaders = () => ({
  apikey: String(SUPABASE_SERVICE_ROLE_KEY),
  Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
});

export const hasAnyStorage = () => hasVercelKv() || hasSupabaseKv();

export const readCollection = async (key: string): Promise<unknown[]> => {
  if (hasVercelKv()) {
    const response = await fetch(`${KV_REST_API_URL}/get/${key}`, { headers: getVercelHeaders() });
    if (!response.ok) return [];
    const data = (await response.json()) as { result?: unknown };
    return Array.isArray(data.result) ? data.result : [];
  }

  if (hasSupabaseKv()) {
    const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_KV_TABLE}?key=eq.${encodeURIComponent(key)}&select=value`;
    const response = await fetch(url, { headers: getSupabaseHeaders() });
    if (!response.ok) return [];
    const rows = (await response.json()) as Array<{ value?: unknown }>;
    const value = rows[0]?.value;
    return Array.isArray(value) ? value : [];
  }

  return [];
};

export const writeCollection = async (key: string, value: unknown[]) => {
  if (hasVercelKv()) {
    await fetch(`${KV_REST_API_URL}/set/${key}`, {
      method: "POST",
      headers: getVercelHeaders(),
      body: JSON.stringify(value),
    });
    return;
  }

  if (hasSupabaseKv()) {
    const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_KV_TABLE}`;
    await fetch(url, {
      method: "POST",
      headers: {
        ...getSupabaseHeaders(),
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([{ key, value }]),
    });
  }
};
