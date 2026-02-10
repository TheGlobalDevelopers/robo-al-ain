import { Product } from "@/types/product";

const PRODUCT_STORAGE_KEY = "storefront-products";
const PRODUCTS_API_URL = import.meta.env.VITE_PRODUCTS_API_URL?.trim() || "/api/products";

type ProductsApiResponse = {
  products?: Product[];
};

const parseProducts = (value: string | null, fallback: Product[]): Product[] => {
  if (!value) {
    return fallback;
  }
  try {
    const parsed = JSON.parse(value) as Product[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const readStoredProducts = (fallback: Product[]): Product[] => {
  if (typeof window === "undefined") {
    return fallback;
  }
  return parseProducts(localStorage.getItem(PRODUCT_STORAGE_KEY), fallback);
};

const writeStoredProducts = (products: Product[]) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
};

export const hasRemoteProductsApi = () => Boolean(PRODUCTS_API_URL);

export const mergeProducts = (products: Product[]): Product[] => {
  const map = new Map<number, Product>();
  products.forEach((product) => {
    map.set(product.id, product);
  });
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
};

const parseProductsResponse = (data: Product[] | ProductsApiResponse): Product[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data.products)) {
    return data.products;
  }
  return [];
};

const fetchRemoteProducts = async (): Promise<Product[]> => {
  if (!PRODUCTS_API_URL) {
    return [];
  }
  try {
    const response = await fetch(PRODUCTS_API_URL, { cache: "no-store" });
    if (!response.ok) {
      return [];
    }
    const data = (await response.json()) as Product[] | ProductsApiResponse;
    return parseProductsResponse(data);
  } catch {
    return [];
  }
};

export const loadProducts = async (fallback: Product[]): Promise<Product[]> => {
  const localProducts = readStoredProducts(fallback);
  if (!PRODUCTS_API_URL) {
    return localProducts;
  }
  const remoteProducts = await fetchRemoteProducts();
  if (!remoteProducts.length) {
    return localProducts;
  }
  const merged = mergeProducts([...localProducts, ...remoteProducts]);
  writeStoredProducts(merged);
  return merged;
};

export const saveProducts = async (products: Product[]) => {
  writeStoredProducts(products);
  if (!PRODUCTS_API_URL) {
    return;
  }
  try {
    await fetch(PRODUCTS_API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    });
  } catch {
    // Ignore network errors; local storage already updated.
  }
};
