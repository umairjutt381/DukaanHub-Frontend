"use client";

import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api/client";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { useToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";

export function ProductActions({ productId, compact = false, stock, showWishlist = true }: { productId: number; compact?: boolean; stock?: number; showWishlist?: boolean }) {
  const add = useCartStore((state) => state.add);
  const wishlisted = useWishlistStore((state) => state.productIds.includes(productId));
  const hydrateWishlist = useWishlistStore((state) => state.hydrate);
  const toggleWishlistItem = useWishlistStore((state) => state.toggle);
  const { notify } = useToast();
  const [busy, setBusy] = useState<"cart" | "wishlist" | null>(null);
  const [quantity, setQuantity] = useState(1);
  const available = stock === undefined || stock > 0;

  useEffect(() => {
    if (showWishlist) void hydrateWishlist();
  }, [hydrateWishlist, showWishlist]);

  const addToCart = async () => {
    if (busy || !available) return false;
    setBusy("cart");
    add(productId, quantity);
    try {
      await api.post("/cart/items", { product_id: productId, quantity });
      window.dispatchEvent(new Event("dukaanhub:cart-changed"));
    } catch {
      // Fallback to local cart when not authenticated.
    } finally {
      setBusy(null);
    }
    notify("Added to cart", "Product was added to your cart.");
    return true;
  };

  const buyNow = async () => {
    const added = await addToCart();
    if (added) window.location.href = "/checkout";
  };

  const toggleWishlist = async () => {
    if (busy) return;
    setBusy("wishlist");
    try {
      const result = await toggleWishlistItem(productId);
      notify(result === "removed" ? "Removed from wishlist" : "Added to wishlist");
    } catch {
      notify("Sign in required", "Please log in to use wishlist.");
    } finally {
      setBusy(null);
    }
  };

  if (compact) {
    return (
      <div className="flex gap-2">
        <Button className="min-h-11 flex-1 rounded-xl px-3 py-2 text-xs shadow-none sm:text-sm" onClick={addToCart} disabled={Boolean(busy) || !available}>
          <ShoppingCart size={15} className="mr-1.5 shrink-0 sm:mr-2" />
          <span className="sm:hidden">{!available ? "Sold" : busy === "cart" ? "Adding" : "Add"}</span>
          <span className="hidden whitespace-nowrap sm:inline">{!available ? "Sold out" : busy === "cart" ? "Adding..." : "Add to cart"}</span>
        </Button>
        {showWishlist ? <button onClick={toggleWishlist} disabled={Boolean(busy)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color:var(--canvas-deep)] text-[color:var(--ink)] transition hover:bg-[color:var(--accent-wash)] disabled:opacity-50" aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={wishlisted}>
          <Heart size={16} className={wishlisted ? "fill-[color:var(--accent)] text-[color:var(--accent)]" : ""} />
        </button> : null}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-[color:var(--canvas-deep)] p-2 pl-4">
        <span className="text-sm font-semibold text-[color:var(--ink)]">Quantity</span>
        <div className="inline-flex h-11 items-center overflow-hidden rounded-xl bg-white shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055]">
          <button type="button" onClick={() => setQuantity((current) => Math.max(1, current - 1))} className="flex h-full w-10 items-center justify-center transition hover:bg-[color:var(--canvas)]" aria-label="Decrease quantity"><Minus size={15} /></button>
          <span className="min-w-9 text-center text-sm font-bold">{quantity}</span>
          <button type="button" onClick={() => setQuantity((current) => Math.min(stock || 99, current + 1))} className="flex h-full w-10 items-center justify-center transition hover:bg-[color:var(--canvas)]" aria-label="Increase quantity"><Plus size={15} /></button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
      <Button className="w-full" onClick={() => void addToCart()} disabled={Boolean(busy) || !available}>
        <ShoppingCart size={16} className="mr-2" /> {busy === "cart" ? "Adding..." : "Add to cart"}
      </Button>
      <Button variant="secondary" className="w-full" onClick={buyNow} disabled={Boolean(busy) || !available}>
        Buy Now
      </Button>
      {showWishlist ? <button onClick={toggleWishlist} disabled={Boolean(busy)} aria-pressed={wishlisted} className="col-span-2 rounded-xl px-5 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--accent-wash)] disabled:opacity-50">
        <Heart size={16} className={`mr-2 inline-block align-[-2px] ${wishlisted ? "fill-[color:var(--accent)] text-[color:var(--accent)]" : ""}`} />
        Wishlist
      </button> : null}
      </div>
    </div>
  );
}
