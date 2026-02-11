const LOCATION_LABEL_COOKIE = "robo_location_label";
const LOCATION_MAP_COOKIE = "robo_location_map";

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

export const saveLocationCookie = (locationMapUrl: string, placeLabel: string) => {
  if (!locationMapUrl.trim() || !placeLabel.trim()) return;
  setCookie(LOCATION_MAP_COOKIE, locationMapUrl.trim(), 45);
  setCookie(LOCATION_LABEL_COOKIE, placeLabel.trim(), 45);
};

export const loadLocationCookie = () => decodeURIComponent(getCookie(LOCATION_MAP_COOKIE));
export const loadLocationLabelCookie = () => decodeURIComponent(getCookie(LOCATION_LABEL_COOKIE));
