"use client";

import Link from "next/link";
import { ArrowRight, Check, Plus, Scale, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AssetImage } from "@/components/ui/asset-image";
import { BrandMark } from "@/components/product/brand-mark";
import { ProductActions } from "@/components/product/product-actions";
import { getProductsByIds } from "@/lib/api/client";
import { shippingEstimate } from "@/lib/product-insights";
import { useCompareStore } from "@/lib/store/compare";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

const rows = [
  ["Price", (product: Product) => formatCurrency(product.price)],
  ["Customer rating", (product: Product) => product.rating ? `${product.rating.toFixed(1)} / 5` : "New"],
  ["Reviews", (product: Product) => `${product.review_count} reviews`],
  ["Availability", (product: Product) => product.stock > 0 ? `${product.stock} available` : "Out of stock"],
  ["Category", (product: Product) => product.category?.name || "—"],
  ["Brand", (product: Product) => product.brand?.name || "DukaanHub"],
  ["Delivery", (product: Product) => shippingEstimate(product) || "Estimate at checkout"]
] as const;

export default function ComparePage() {
  const productIds = useCompareStore((state) => state.productIds);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!productIds.length) {
      setProducts([]);
      setLoadError(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(false);
    getProductsByIds(productIds)
      .then((items) => {
        if (!active) return;
        const byId = new Map(items.map((item) => [item.id, item]));
        setProducts(productIds.map((id) => byId.get(id)).filter(Boolean) as Product[]);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setLoadError(true);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [productIds]);

  return (
    <section className="container-page py-12 md:py-16" aria-labelledby="compare-heading">
      <nav className="text-xs font-semibold text-[color:var(--muted)]" aria-label="Breadcrumb"><Link href="/">Home</Link> <span className="mx-2">/</span> Compare</nav>
      <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow">Decision workspace</p>
          <h1 id="compare-heading" className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--ink)] sm:text-6xl">Compare without the noise.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--muted)]">See price, availability and the details that matter in one clean view. Add up to four products from anywhere in the catalog.</p>
        </div>
        {products.length ? <button type="button" onClick={clear} className="min-h-11 rounded-xl bg-[color:var(--canvas-deep)] px-4 text-sm font-semibold transition hover:bg-[color:var(--line)]">Clear comparison</button> : null}
      </div>

      {loading ? (
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: Math.max(2, productIds.length) }).map((_, index) => <div key={index} className="aspect-[3/5] animate-pulse rounded-[24px] bg-[color:var(--canvas-deep)]" />)}</div>
      ) : loadError ? (
        <section className="mt-12 rounded-[28px] bg-[color:var(--canvas-deep)] px-6 py-14 text-center">
          <h2 className="text-2xl font-semibold tracking-[-0.035em]">Comparison is temporarily unavailable.</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[color:var(--muted)]">Your selection is still saved. Try loading the product details again.</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-6 min-h-11 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Try again</button>
        </section>
      ) : products.length ? (
        <div className="mt-12 overflow-hidden rounded-[28px] bg-white shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055]">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid" style={{ gridTemplateColumns: `180px repeat(${products.length}, minmax(210px, 1fr))` }}>
                <div className="border-b border-[color:var(--line)] bg-[color:var(--canvas-deep)] p-6 text-sm font-semibold">Selected products</div>
                {products.map((product) => (
                  <div key={product.id} className="relative border-b border-l border-[color:var(--line)] p-5">
                    <button type="button" onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:text-[color:var(--danger)]"><Trash2 size={15} /></button>
                    <Link href={`/product/${product.slug}`} className="block">
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[color:var(--canvas-deep)]"><AssetImage src={product.images?.[0]?.url} alt={product.name} fill sizes="260px" className="object-contain p-3" /></div>
                      <div className="mt-4 flex items-center gap-2"><BrandMark name={product.brand?.name} /><span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[color:var(--muted)]">{product.brand?.name || "DukaanHub"}</span></div>
                      <h2 className="mt-3 line-clamp-2 min-h-12 font-semibold leading-6 tracking-[-0.02em]">{product.name}</h2>
                    </Link>
                    <div className="mt-4"><ProductActions productId={product.id} stock={product.stock} compact showWishlist={false} /></div>
                  </div>
                ))}

                {rows.map(([label, value]) => (
                  <div className="contents" key={label}>
                    <div className="border-b border-[color:var(--line)] bg-[color:var(--canvas-deep)] p-5 text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--muted)]">{label}</div>
                    {products.map((product) => <div key={`${label}-${product.id}`} className="border-b border-l border-[color:var(--line)] p-5 text-sm font-medium text-[color:var(--ink)]">{value(product)}</div>)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <section className="mt-12 overflow-hidden rounded-[28px] bg-[color:var(--canvas-deep)]">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            <div className="p-8 sm:p-12 lg:p-16">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[color:var(--accent-dark)] shadow-sm"><Scale size={21} /></span>
              <h2 className="mt-8 text-3xl font-semibold tracking-[-0.04em]">Start with two products.</h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[color:var(--muted)]">Use the compare icon on any product card. Your selection stays with you while you continue browsing.</p>
              <Link href="/products" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Explore the catalog <ArrowRight size={16} /></Link>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:p-6">
              {["Choose products", "Review details", "Buy confidently"].map((step, index) => (
                <div key={step} className="flex min-h-52 flex-col justify-between rounded-[20px] bg-white p-6 shadow-[var(--shadow-xs)]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]">{index === 0 ? <Plus size={16} /> : <Check size={16} />}</span>
                  <div><p className="text-xs font-bold text-[color:var(--muted-light)]">0{index + 1}</p><p className="mt-2 font-semibold">{step}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
