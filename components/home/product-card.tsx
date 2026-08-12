"use client";

import Link from "next/link";
import { Check, Eye, Heart, Scale, Star, Truck } from "lucide-react";
import { useEffect, useState } from "react";

import { AssetImage } from "@/components/ui/asset-image";
import { BrandMark } from "@/components/product/brand-mark";
import { ProductActions } from "@/components/product/product-actions";
import { ProductQuickView } from "@/components/product/product-quick-view";
import { useCompareStore } from "@/lib/store/compare";
import { hasFreeShipping, shippingEstimate } from "@/lib/product-insights";
import { useWishlistStore } from "@/lib/store/wishlist";
import type { Product } from "@/lib/types";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, resolveAssetUrl } from "@/lib/utils";

function IconAction({ label, active = false, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm ring-1 ring-black/[0.06] backdrop-blur transition duration-200 hover:-translate-y-0.5 ${active ? "bg-[color:var(--accent)] text-white" : "bg-white/90 text-[color:var(--ink)] hover:bg-white"}`}
    >
      {children}
    </button>
  );
}

export function ProductCard({ product, view = "grid" }: { product: Product; view?: "grid" | "list" }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const compareIds = useCompareStore((state) => state.productIds);
  const toggleCompare = useCompareStore((state) => state.toggle);
  const wishlisted = useWishlistStore((state) => state.productIds.includes(product.id));
  const hydrateWishlist = useWishlistStore((state) => state.hydrate);
  const toggleWishlistItem = useWishlistStore((state) => state.toggle);
  const { notify } = useToast();
  const images = [...(product.images || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
  const primaryImage = resolveAssetUrl(images[0]?.url);
  const hoverImage = images[1] ? resolveAssetUrl(images[1].url) : null;
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;
  const compared = compareIds.includes(product.id);
  const lowStock = product.stock > 0 && product.stock <= 12;
  const freeShipping = hasFreeShipping(product);
  const deliveryEstimate = shippingEstimate(product);

  useEffect(() => {
    void hydrateWishlist();
  }, [hydrateWishlist]);

  const toggleWishlist = async () => {
    if (wishlistBusy) return;
    setWishlistBusy(true);
    try {
      const result = await toggleWishlistItem(product.id);
      notify(result === "removed" ? "Removed from wishlist" : "Saved to wishlist", product.name);
    } catch {
      notify("Sign in to save products", "Your wishlist is available after signing in.");
    } finally {
      setWishlistBusy(false);
    }
  };

  const onCompare = () => {
    if (!compared && compareIds.length >= 4) {
      notify("Comparison is full", "Remove one item before adding another.");
      return;
    }
    toggleCompare(product.id);
    notify(compared ? "Removed from compare" : "Added to compare", product.name);
  };

  const media = (
    <div className={`relative overflow-hidden rounded-lg border border-[color:var(--line)] bg-[color:var(--canvas-deep)] ${view === "list" ? "aspect-square h-full min-h-56" : "aspect-square"}`}>
      <Link href={`/product/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--accent)]">
        <AssetImage src={primaryImage} alt={product.name} fill sizes={view === "list" ? "280px" : "(min-width: 1280px) 23vw, (min-width: 768px) 33vw, 50vw"} className="object-contain p-4 transition duration-500 ease-out group-hover:scale-[1.035] sm:p-5" />
        {hoverImage ? <AssetImage src={hoverImage} alt="" fill sizes="(min-width: 1280px) 23vw, 50vw" className="object-contain p-4 opacity-0 transition duration-500 ease-out group-hover:scale-[1.025] group-hover:opacity-100 sm:p-5" /> : null}
      </Link>
      <div className="pointer-events-none absolute inset-x-3 top-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {discount ? <span className="rounded-full bg-[color:var(--ink)] px-2.5 py-1 text-[0.66rem] font-bold text-white">-{discount}%</span> : null}
          {product.is_new_arrival ? <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[color:var(--ink)] shadow-sm backdrop-blur">New</span> : null}
          {lowStock ? <span className="rounded-full bg-amber-50/95 px-2.5 py-1 text-[0.66rem] font-bold text-amber-800 shadow-sm">Low stock</span> : null}
        </div>
        <div className="pointer-events-auto flex flex-col gap-2 opacity-100 transition duration-200 md:translate-x-2 md:opacity-0 md:group-hover:translate-x-0 md:group-hover:opacity-100 md:group-focus-within:translate-x-0 md:group-focus-within:opacity-100">
          <IconAction label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`} active={wishlisted} onClick={toggleWishlist}><Heart size={16} className={wishlisted ? "fill-current" : ""} /></IconAction>
          <IconAction label={`Quick view ${product.name}`} onClick={() => setQuickViewOpen(true)}><Eye size={16} /></IconAction>
          <IconAction label={compared ? `Remove ${product.name} from comparison` : `Compare ${product.name}`} active={compared} onClick={onCompare}><Scale size={16} /></IconAction>
        </div>
      </div>
      {freeShipping ? <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[0.64rem] font-semibold text-[color:var(--ink)] shadow-sm backdrop-blur"><Truck size={12} className="text-[color:var(--accent)]" /> Free shipping</span> : null}
    </div>
  );

  const details = (
      <div className={`flex min-w-0 flex-1 flex-col ${view === "list" ? "p-2 sm:p-5" : "px-0.5 pb-0.5 pt-2.5"}`}>
      <div className="flex items-center gap-2.5">
        <BrandMark name={product.brand?.name} />
        <p className="truncate text-[0.58rem] font-bold uppercase tracking-[0.1em] text-[color:var(--muted)]">{product.brand?.name || "DukaanHub"}</p>
      </div>
      <Link href={`/product/${product.slug}`} className={`mt-1.5 line-clamp-2 font-bold leading-5 tracking-[-0.02em] text-[color:var(--ink)] transition hover:text-[color:var(--accent-dark)] ${view === "list" ? "text-xl sm:text-2xl" : "text-[0.78rem] sm:text-sm"}`}>{product.name}</Link>

      <div className="mt-1.5 flex items-center gap-1.5 text-[0.65rem]">
        <span className="inline-flex items-center gap-1 font-semibold text-[color:var(--ink)]"><Star size={13} className="fill-amber-400 text-amber-400" /> {product.rating ? product.rating.toFixed(1) : "New"}</span>
        <span className="text-[color:var(--muted)]">{product.review_count ? `${product.review_count} reviews` : "No reviews"}</span>
      </div>

      {view === "list" ? <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{product.description}</p> : null}

      <div className="mt-2 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        <span className="text-sm font-bold tracking-[-0.025em] text-[color:var(--ink)]">{formatCurrency(product.price)}</span>
        {product.compare_at_price ? <span className="text-xs text-[color:var(--muted-light)] line-through">{formatCurrency(product.compare_at_price)}</span> : null}
        {discount ? <span className="text-xs font-semibold text-[color:var(--accent-dark)]">Save {discount}%</span> : null}
      </div>
      <div className={`mt-2 space-y-1 text-[0.62rem] text-[color:var(--muted)] ${view === "list" ? "sm:flex sm:gap-5 sm:space-y-0" : ""}`}>
        <p className="flex items-center gap-1.5"><Check size={13} className="text-[color:var(--accent)]" /> {deliveryEstimate || "Delivery estimate at checkout"}</p>
        <p className="flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? "bg-[color:var(--accent)]" : "bg-[color:var(--danger)]"}`} />{product.stock > 0 ? "Ready to ship" : "Currently unavailable"}</p>
      </div>

      <div className={`mt-auto pt-5 ${view === "list" ? "max-w-sm" : ""}`}><ProductActions productId={product.id} stock={product.stock} compact showWishlist={false} /></div>
    </div>
  );

  return (
    <>
      <article className={`group relative h-full ${view === "list" ? "grid gap-5 rounded-[24px] bg-white p-3 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055] sm:grid-cols-[260px_minmax(0,1fr)]" : "flex flex-col"}`}>
        {media}
        {details}
      </article>
      <ProductQuickView product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}
