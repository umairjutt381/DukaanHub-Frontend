import axios from "axios";
import { getConfiguredApiBaseUrl } from "@/lib/api/base-url";
import { getStoredToken } from "@/lib/store/auth";
import type { Product } from "@/lib/types";

export const api = axios.create({
  baseURL: getConfiguredApiBaseUrl(),
  withCredentials: false
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  const url = config.url || "";
  const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register") || url.includes("/auth/forgot") || url.includes("/auth/reset");
  if (token && !isAuthEndpoint) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const productLookupBatchSize = 100;

export async function getProductsByIds(productIds: number[]): Promise<Product[]> {
  const uniqueIds = Array.from(new Set(productIds.filter((id) => Number.isInteger(id) && id > 0)));
  if (!uniqueIds.length) return [];

  const batches: number[][] = [];
  for (let index = 0; index < uniqueIds.length; index += productLookupBatchSize) {
    batches.push(uniqueIds.slice(index, index + productLookupBatchSize));
  }

  const responses = await Promise.all(
    batches.map((batch) => {
      const params = new URLSearchParams();
      batch.forEach((id) => params.append("ids", String(id)));
      return api.get<Product[]>(`/catalog/products/by-ids?${params.toString()}`);
    })
  );

  return responses.flatMap((response) => response.data);
}
