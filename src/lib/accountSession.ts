const ACCOUNT_ID_KEY = "storefront-current-account-id";
const SESSION_API_URL = import.meta.env.VITE_SESSION_API_URL?.trim() || "/api/session";

type SessionApiResponse = {
  session?: {
    currentAccountId?: number | null;
  };
};

export const loadCurrentAccountId = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ACCOUNT_ID_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
};

export const saveCurrentAccountId = (id: number | null) => {
  if (typeof window === "undefined") return;
  if (id === null) {
    localStorage.removeItem(ACCOUNT_ID_KEY);
    return;
  }
  localStorage.setItem(ACCOUNT_ID_KEY, String(id));
};

export const hasRemoteSessionApi = () => Boolean(SESSION_API_URL);

export const loadCurrentAccountIdRemote = async () => {
  const local = loadCurrentAccountId();
  if (!SESSION_API_URL) return local;
  try {
    const response = await fetch(SESSION_API_URL, { cache: "no-store" });
    if (!response.ok) return local;
    const data = (await response.json()) as SessionApiResponse;
    const remoteId = Number(data.session?.currentAccountId);
    const accountId = Number.isFinite(remoteId) ? remoteId : null;
    saveCurrentAccountId(accountId);
    return accountId;
  } catch {
    return local;
  }
};

export const saveCurrentAccountIdRemote = async (id: number | null) => {
  saveCurrentAccountId(id);
  if (!SESSION_API_URL) return;
  try {
    await fetch(SESSION_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentAccountId: id }),
    });
  } catch {
    // Local storage is still updated.
  }
};
