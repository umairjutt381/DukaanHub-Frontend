"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, LogIn, RefreshCw, ShoppingBag, Star, Trash2 } from "lucide-react";

import { CommerceBreadcrumb, CommerceEmptyState, CommerceTrustStrip } from "@/components/commerce/commerce-primitives";
import { BrandMark } from "@/components/product/brand-mark";
import { AssetImage } from "@/components/ui/asset-image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";
import { useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type WishlistProduct = Pick<Product, "id" | "name" | "slug" | "price" | "compare_at_price" | "stock" | "images"> & Partial<Product>;
type WishlistEntry = { id: number; product: WishlistProduct | null };

function primaryImage(product: WishlistProduct) {
  return product.images?.find((image) => image.is_primary)?.url || product.images?.[0]?.url;
}

function discountFor(product: WishlistProduct) {
  if (!product.compare_at_price || product.compare_at_price <= product.price) return 0;
  return Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100);
}

export default function WishlistPage() {
  const [entries, setEntries] = useState<WishlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const addToLocalCart = useCartStore((state) => state.add);
  const setWishlistProductIds = useWishlistStore((state) => state.setProductIds);
  const toggleWishlistItem = useWishlistStore((state) => state.toggle);
  const { notify } = useToast();

  useEffect(() => {
    const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("dukaanhub_token"));
    if (!hasToken) {
      setAuthRequired(true);
      setLoading(false);
      return;
    }

    api.get("/wishlist")
      .then((response) => {
        const nextEntries = (response.data.items || []).filter((entry: WishlistEntry) => Boolean(entry.product));
        setEntries(nextEntries);
        setWishlistProductIds(nextEntries.map((entry: WishlistEntry) => entry.product?.id).filter((id: number | undefined): id is number => typeof id === "number"));
        setError("");
      })
      .catch((requestError) => {
        if (requestError?.response?.status === 401) setAuthRequired(true);
        else setError("We could not load your wishlist. Please try again shortly.");
      })
      .finally(() => setLoading(false));
  }, [setWishlistProductIds]);

  const removeFromWishlist = async (entry: WishlistEntry) => {
    if (!entry.product) return;
    setBusyId(entry.product.id);
    try {
      const result = await toggleWishlistItem(entry.product.id);
      if (result !== "removed") throw new Error("Wishlist item was not removed");
      setEntries((current) => current.filter((item) => item.id !== entry.id));
      notify("Removed from wishlist", `${entry.product.name} was removed.`);
    } catch {
      notify("Unable to update wishlist", "Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const addToCart = async (product: WishlistProduct) => {
    setBusyId(product.id);
    addToLocalCart(product.id, 1);
    try {
      await api.post("/cart/items", { product_id: product.id, quantity: 1 });
      window.dispatchEvent(new Event("dukaanhub:cart-changed"));
      notify("Added to cart", `${product.name} is ready in your bag.`);
    } catch {
      notify("Added for this visit", `${product.name} is available in your local cart.`);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="pb-20 md:pb-28">
      <section className="container-page pt-6 sm:pt-8">
        <CommerceBreadcrumb current="Wishlist" />
        <div className="mt-5 grid gap-8 border-b border-[color:var(--line)] pb-8 md:grid-cols-[minmax(0,1fr)_360px] md:items-end md:pb-10">
          <div>
            <p className="eyebrow">Your private edit</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-[color:var(--ink)] sm:text-6xl">Saved for later</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">A quiet place for the products worth another look. Move them to your bag whenever the decision feels right.</p>
          </div>
          {!loading && !authRequired ? (
            <div className="flex items-center justify-between gap-4 rounded-2xl bg-[color:var(--canvas-deep)] px-5 py-4 md:justify-self-end">
              <span className="grid size-9 place-items-center rounded-xl bg-white text-[color:var(--accent-dark)]"><Heart size={17} className="fill-current" /></span>
              <div><p className="text-lg font-semibold tabular-nums tracking-[-0.02em] text-[color:var(--ink)]">{entries.length}</p><p className="text-xs text-[color:var(--muted)]">saved item{entries.length === 1 ? "" : "s"}</p></div>
            </div>
          ) : null}
        </div>

        {loading ? (
          <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => <div key={item}><Skeleton className="aspect-[4/5] rounded-[22px]" /><Skeleton className="mt-5 h-3 w-24" /><Skeleton className="mt-3 h-5 w-4/5" /><Skeleton className="mt-5 h-12 w-full" /></div>)}
          </div>
        ) : authRequired ? (
          <CommerceEmptyState icon={LogIn} eyebrow="Account required" title="Your wishlist travels with you." description="Sign in to see saved products on every device, or create an account to start your first edit.">
            <Link href="/login?returnTo=%2Fwishlist" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Sign in</Link>
            <Link href="/register?returnTo=%2Fwishlist" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[color:var(--ink)] ring-1 ring-black/[0.07] transition hover:ring-black/20">Create account</Link>
          </CommerceEmptyState>
        ) : error ? (
          <CommerceEmptyState icon={RefreshCw} eyebrow="Wishlist unavailable" title="Your saved items are taking a moment." description={error}>
            <button type="button" onClick={() => window.location.reload()} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Try again</button>
          </CommerceEmptyState>
        ) : entries.length ? (
          <>
            <div className="mt-10 grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {entries.map((entry) => {
                const product = entry.product;
                if (!product) return null;
                const busy = busyId === product.id;
                const discount = discountFor(product);
                return (
                  <article key={entry.id} className="group flex h-full flex-col">
                    <div className="relative">
                      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-[22px] bg-[color:var(--canvas-deep)]">
                        <AssetImage src={primaryImage(product)} alt={product.name} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-contain p-3 transition duration-500 ease-out group-hover:scale-[1.04]" />
                      </Link>
                      <button type="button" onClick={() => removeFromWishlist(entry)} disabled={busy} aria-label={`Remove ${product.name} from wishlist`} className="absolute right-3 top-3 grid size-11 place-items-center rounded-full bg-white/90 text-[color:var(--ink)] shadow-sm ring-1 ring-black/[0.05] backdrop-blur transition hover:-translate-y-0.5 hover:text-[color:var(--danger)] disabled:opacity-40"><Trash2 size={16} /></button>
                      <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-2">
                        {discount ? <span className="rounded-full bg-[color:var(--ink)] px-2.5 py-1 text-[0.68rem] font-semibold text-white">-{discount}%</span> : null}
                        {product.stock > 0 && product.stock <= 10 ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[0.68rem] font-semibold text-amber-800">Only {product.stock} left</span> : null}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col px-1 pt-5">
                      <div className="flex items-center gap-2.5">
                        <BrandMark name={product.brand?.name} />
                        <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">{product.brand?.name || "DukaanHub"}</p>
                      </div>
                      <Link href={`/product/${product.slug}`} className="mt-3 line-clamp-2 text-base font-semibold leading-6 tracking-[-0.025em] text-[color:var(--ink)] transition hover:text-[color:var(--accent-dark)]">{product.name}</Link>
                      <div className="mt-2 flex items-center gap-2 text-xs text-[color:var(--muted)]">
                        {product.rating ? <span className="inline-flex items-center gap-1 font-semibold text-[color:var(--ink)]"><Star size={12} className="fill-amber-400 text-amber-400" />{product.rating.toFixed(1)}</span> : null}
                        {product.review_count ? <span>{product.review_count} reviews</span> : <span>Saved item</span>}
                      </div>
                      <div className="mt-4 flex flex-wrap items-baseline gap-2">
                        <p className="text-xl font-semibold tracking-[-0.035em] text-[color:var(--ink)]">{formatCurrency(product.price)}</p>
                        {product.compare_at_price ? <p className="text-xs text-[color:var(--muted-light)] line-through">{formatCurrency(product.compare_at_price)}</p> : null}
                      </div>
                      <p className={`mt-2 text-xs font-medium ${product.stock > 0 ? "text-[color:var(--accent-dark)]" : "text-[color:var(--danger)]"}`}>{product.stock > 0 ? "Ready to ship" : "Currently unavailable"}</p>
                      <Button type="button" onClick={() => addToCart(product)} disabled={busy || product.stock <= 0} className="mt-5 w-full">
                        <ShoppingBag size={16} className="mr-2" /> {busy ? "Updating…" : "Move to bag"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="mt-16"><CommerceTrustStrip /></div>
          </>
        ) : (
          <CommerceEmptyState icon={Heart} eyebrow="Your private edit" title="Nothing saved yet." description="Tap the heart on any product to build a shortlist that is easy to revisit.">
            <Link href="/products" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Explore products <ArrowRight size={16} className="ml-2" /></Link>
          </CommerceEmptyState>
        )}
      </section>
    </div>
  );
}
