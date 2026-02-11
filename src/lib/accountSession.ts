const ACCOUNT_ID_KEY = "storefront-current-account-id";

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
