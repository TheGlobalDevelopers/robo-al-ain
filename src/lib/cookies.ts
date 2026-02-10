const LOCATION_COOKIE = "robo_user_location";

export const setCookie = (name: string, value: string, days = 30) => {
  if (typeof document === "undefined") return;
  const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expiry}; path=/; SameSite=Lax`;
};

export const getCookie = (name: string) => {
  if (typeof document === "undefined") return "";
  const key = `${name}=`;
  return document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(key))
    ?.slice(key.length) ?? "";
};

export const saveLocationCookie = (location: string) => {
  if (!location.trim()) return;
  setCookie(LOCATION_COOKIE, location.trim(), 45);
};

export const loadLocationCookie = () => decodeURIComponent(getCookie(LOCATION_COOKIE));
