import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = { product_id: number; quantity: number };

type CartState = {
  items: CartItem[];
  remoteItems: CartItem[];
  add: (product_id: number, quantity?: number) => void;
  remove: (product_id: number) => void;
  setQuantity: (product_id: number, quantity: number) => void;
  setRemoteItems: (items: CartItem[]) => void;
  clear: () => void;
};

export function mergedCartItemCount(localItems: CartItem[], remoteItems: CartItem[]) {
  const quantities = new Map(localItems.map((item) => [item.product_id, item.quantity]));
  remoteItems.forEach((item) => quantities.set(item.product_id, item.quantity));
  return Array.from(quantities.values()).reduce((total, quantity) => total + quantity, 0);
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      remoteItems: [],
      add: (product_id, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.product_id === product_id);
          if (existing) return { items: state.items.map((item) => (item.product_id === product_id ? { ...item, quantity: item.quantity + quantity } : item)) };
          return { items: [...state.items, { product_id, quantity }] };
        }),
      remove: (product_id) => set((state) => ({ items: state.items.filter((item) => item.product_id !== product_id) })),
      setQuantity: (product_id, quantity) =>
        set((state) => ({
          items: quantity <= 0 ? state.items.filter((item) => item.product_id !== product_id) : state.items.map((item) => (item.product_id === product_id ? { ...item, quantity } : item))
        })),
      setRemoteItems: (remoteItems) => set({ remoteItems }),
      clear: () => set({ items: [] })
    }),
    {
      name: "dukaanhub_cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
