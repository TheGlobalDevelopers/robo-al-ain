import { SiteSettings, defaultSettings } from "@/types/settings";

const STORAGE_KEY = "storefront-settings";
const API_URL = import.meta.env.VITE_SETTINGS_API_URL?.trim() || "/api/settings";

type ApiResponse = { settings?: SiteSettings };

const parse = (value: string | null): SiteSettings => {
  if (!value) return defaultSettings;
  try {
    const parsed = JSON.parse(value) as SiteSettings;
    return parsed?.integrations ? parsed : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const readLocal = () => (typeof window === "undefined" ? defaultSettings : parse(localStorage.getItem(STORAGE_KEY)));

const writeLocal = (settings: SiteSettings) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }
};

export const hasRemoteSettingsApi = () => Boolean(API_URL);

export const loadSettings = async () => {
  const local = readLocal();
  if (!API_URL) return local;
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) return local;
    const data = (await response.json()) as ApiResponse | SiteSettings;
    const remote = "integrations" in data ? data : data.settings;
    if (!remote) return local;
    writeLocal(remote);
    return remote;
  } catch {
    return local;
  }
};

export const saveSettings = async (settings: SiteSettings) => {
  writeLocal(settings);
  if (!API_URL) return;
  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings }),
    });
  } catch {
    // local fallback already saved
  }
};
