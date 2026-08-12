import { create } from "zustand";

import { api } from "@/lib/api/client";
import { getStoredToken } from "@/lib/store/auth";

type WishlistToggleResult = "added" | "removed";

type WishlistState = {
  productIds: number[];
  hydrated: boolean;
  hydrating: boolean;
  sessionToken: string | null;
  hydrate: (force?: boolean) => Promise<void>;
  toggle: (productId: number) => Promise<WishlistToggleResult>;
  setProductIds: (productIds: number[]) => void;
  removeLocal: (productId: number) => void;
};

function uniqueProductIds(values: number[]) {
  return Array.from(new Set(values.filter((value) => Number.isInteger(value) && value > 0)));
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  hydrated: false,
  hydrating: false,
  sessionToken: null,
  hydrate: async (force = false) => {
    const token = getStoredToken();
    if (!token) {
      set({ productIds: [], hydrated: true, hydrating: false, sessionToken: null });
      return;
    }
    const state = get();
    if (state.hydrating || (!force && state.hydrated && state.sessionToken === token)) return;
    set({ hydrating: true, sessionToken: token });
    try {
      const response = await api.get("/wishlist");
      const ids = (response.data?.items || [])
        .map((entry: { product?: { id?: number } | null }) => entry.product?.id)
        .filter((id: unknown): id is number => typeof id === "number");
      set({ productIds: uniqueProductIds(ids), hydrated: true, hydrating: false, sessionToken: token });
    } catch {
      set({ productIds: [], hydrated: true, hydrating: false, sessionToken: token });
    }
  },
  toggle: async (productId) => {
    const response = await api.post(`/wishlist/${productId}`);
    const removed = /removed/i.test(String(response.data?.message || ""));
    set((state) => ({
      productIds: removed
        ? state.productIds.filter((id) => id !== productId)
        : uniqueProductIds([...state.productIds, productId])
    }));
    return removed ? "removed" : "added";
  },
  setProductIds: (productIds) => set({ productIds: uniqueProductIds(productIds), hydrated: true, sessionToken: getStoredToken() }),
  removeLocal: (productId) => set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) }))
}));
