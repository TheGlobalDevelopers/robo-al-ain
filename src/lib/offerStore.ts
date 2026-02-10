import { Offer } from "@/types/offer";

const STORAGE_KEY = "storefront-offers";
const API_URL = import.meta.env.VITE_OFFERS_API_URL?.trim() || "/api/offers";

type ApiResponse = { offers?: Offer[] };

const parse = (value: string | null): Offer[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as Offer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const readLocal = () => (typeof window === "undefined" ? [] : parse(localStorage.getItem(STORAGE_KEY)));

const writeLocal = (offers: Offer[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
  }
};

export const hasRemoteOffersApi = () => Boolean(API_URL);

export const mergeOffers = (offers: Offer[]) => {
  const map = new Map<number, Offer>();
  offers.forEach((offer) => map.set(offer.id, offer));
  return Array.from(map.values()).sort((a, b) => b.id - a.id);
};

const parseResponse = (data: Offer[] | ApiResponse) => {
  if (Array.isArray(data)) return data;
  return Array.isArray(data.offers) ? data.offers : [];
};

const fetchRemote = async () => {
  if (!API_URL) return [];
  try {
    const response = await fetch(API_URL, { cache: "no-store" });
    if (!response.ok) return [];
    return parseResponse((await response.json()) as Offer[] | ApiResponse);
  } catch {
    return [];
  }
};

export const loadOffers = async () => {
  const local = readLocal();
  if (!API_URL) return local;
  const remote = await fetchRemote();
  if (!remote.length) return local;
  const merged = mergeOffers([...remote, ...local]);
  writeLocal(merged);
  return merged;
};

export const saveOffers = async (offers: Offer[]) => {
  writeLocal(offers);
  if (!API_URL) return;
  try {
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offers }),
    });
  } catch {
    // local fallback already saved
  }
};
