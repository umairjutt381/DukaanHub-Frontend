import { create } from "zustand";
import { persist } from "zustand/middleware";

type CompareState = {
  productIds: number[];
  toggle: (productId: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set) => ({
      productIds: [],
      toggle: (productId) => set((state) => {
        if (state.productIds.includes(productId)) {
          return { productIds: state.productIds.filter((id) => id !== productId) };
        }
        if (state.productIds.length >= 4) return state;
        return { productIds: [...state.productIds, productId] };
      }),
      remove: (productId) => set((state) => ({ productIds: state.productIds.filter((id) => id !== productId) })),
      clear: () => set({ productIds: [] })
    }),
    { name: "dukaanhub_compare" }
  )
);
