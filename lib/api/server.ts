import { Product, Category, Brand, ApiList } from "@/lib/types";
import { resolveApiBaseUrl } from "@/lib/api/base-url";

export type ProductQuery = {
  q?: string;
  category?: string;
  brand?: string;
  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  deal?: boolean;
  page?: number;
  page_size?: number;
};

const base = resolveApiBaseUrl();

export class ServerApiError extends Error {
  constructor(public readonly status: number, path: string) {
    super(`Request failed (${status}): ${path}`);
    this.name = "ServerApiError";
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`, { cache: "no-store" });
  if (!res.ok) throw new ServerApiError(res.status, path);
  return res.json();
}

function productQueryString(query: ProductQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });

  const search = params.toString();
  return search ? `?${search}` : "";
}

export const serverApi = {
  home: () => getJson<any>("/home"),
  products: (query: ProductQuery = {}) => getJson<ApiList<Product>>(`/catalog/products${productQueryString(query)}`),
  product: (slug: string) => getJson<Product>(`/catalog/products/${slug}`),
  categories: () => getJson<Category[]>("/catalog/categories"),
  brands: () => getJson<Brand[]>("/catalog/brands")
};
