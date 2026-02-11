import { UserAccount } from "@/types/account";

const STORAGE_KEY = "storefront-accounts";
const API_URL = import.meta.env.VITE_ACCOUNTS_API_URL?.trim() || "/api/accounts";

type AccountsApiResponse = { accounts?: UserAccount[] };

const parseAccounts = (raw: string | null): UserAccount[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as UserAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readLocal = () => (typeof window === "undefined" ? [] : parseAccounts(localStorage.getItem(STORAGE_KEY)));

const writeLocal = (accounts: UserAccount[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }
};

export const mergeAccounts = (accounts: UserAccount[]) => {
  const map = new Map<number, UserAccount>();
  accounts.forEach((account) => map.set(account.id, account));
  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

export const hasRemoteAccountsApi = () => Boolean(API_URL);

const parseResponse = (value: UserAccount[] | AccountsApiResponse) => {
  if (Array.isArray(value)) return value;
  return Array.isArray(value.accounts) ? value.accounts : [];
};

export const loadAccounts = async () => {
  const local = readLocal();
  if (!API_URL) return local;

  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) return local;
    const data = (await response.json()) as UserAccount[] | AccountsApiResponse;
    const remote = parseResponse(data);
    if (!remote.length) return local;
    const merged = mergeAccounts([...remote, ...local]);
    writeLocal(merged);
    return merged;
  } catch {
    return local;
  }
};

export const saveAccounts = async (accounts: UserAccount[]) => {
  writeLocal(accounts);
  if (!API_URL) return;
  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accounts }),
    });
  } catch {
    // keep local data
  }
};

export const createAccount = async (account: UserAccount) => {
  const merged = mergeAccounts([account, ...readLocal()]);
  writeLocal(merged);
  if (!API_URL) return merged;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(account),
    });
    if (!response.ok) return merged;
    const data = (await response.json()) as UserAccount[] | AccountsApiResponse;
    const remote = parseResponse(data);
    if (!remote.length) return merged;
    const next = mergeAccounts([...merged, ...remote]);
    writeLocal(next);
    return next;
  } catch {
    return merged;
  }
};
