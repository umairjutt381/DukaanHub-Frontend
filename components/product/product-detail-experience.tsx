"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Expand, PackageCheck, RotateCcw, ShieldCheck, Star, Truck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ProductGrid } from "@/components/home/product-grid";
import { AssetImage } from "@/components/ui/asset-image";
import { BrandMark } from "@/components/product/brand-mark";
import { ProductActions } from "@/components/product/product-actions";
import { returnWindow, shippingEstimate } from "@/lib/product-insights";
import type { Product } from "@/lib/types";
import { formatCurrency, resolveAssetUrl } from "@/lib/utils";

export function ProductDetailExperience({ product, related }: { product: Product; related: Product[] }) {
  const images = [...(product.images || [])].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
  const gallery = images.length ? images : [{ id: 0, url: "/brand/product-placeholder.svg", is_primary: true, sort_order: 0 }];
  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const zoomTriggerRef = useRef<HTMLButtonElement>(null);
  const zoomCloseRef = useRef<HTMLButtonElement>(null);
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;
  const specifications = (product.specifications || "").split(";").map((item) => item.trim()).filter(Boolean);
  const deliveryEstimate = shippingEstimate(product);
  const returns = returnWindow(product);
  const serviceItems = [
    { icon: Truck, title: "Delivery estimate", detail: deliveryEstimate || "Calculated at checkout" },
    { icon: ShieldCheck, title: "Secure checkout", detail: "Protected account and order details" },
    { icon: RotateCcw, title: "Returns", detail: returns || "See the return policy for eligibility" },
    { icon: PackageCheck, title: "Tracked order", detail: "Follow status from your account" }
  ];

  useEffect(() => {
    setActiveImage(0);
    setZoomOpen(false);
  }, [product.id]);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem("dukaanhub_recently_viewed") || "[]");
      const ids = Array.isArray(stored) ? stored.filter((id): id is number => Number.isInteger(id) && id !== product.id) : [];
      window.localStorage.setItem("dukaanhub_recently_viewed", JSON.stringify([product.id, ...ids].slice(0, 12)));
    } catch {
      window.localStorage.setItem("dukaanhub_recently_viewed", JSON.stringify([product.id]));
    }
  }, [product.id]);

  useEffect(() => {
    if (!zoomOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => zoomCloseRef.current?.focus(), 0);
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
      if (event.key === "Tab") {
        event.preventDefault();
        zoomCloseRef.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", close);
      zoomTriggerRef.current?.focus();
    };
  }, [zoomOpen]);

  return (
    <div className="pb-28 md:pb-0">
      <section className="container-page py-6 md:py-10">
        <nav className="flex min-w-0 items-center gap-2 overflow-hidden text-xs font-medium text-[color:var(--muted)]" aria-label="Breadcrumb">
          <Link href="/" className="shrink-0 hover:text-[color:var(--ink)]">Home</Link><ChevronRight size={13} className="shrink-0" />
          <Link href="/products" className="shrink-0 hover:text-[color:var(--ink)]">Shop</Link>
          {product.category ? <><ChevronRight size={13} className="shrink-0" /><Link href={`/category/${product.category.slug}`} className="shrink-0 hover:text-[color:var(--ink)]">{product.category.name}</Link></> : null}
          <ChevronRight size={13} className="shrink-0" /><span className="truncate text-[color:var(--ink)]">{product.name}</span>
        </nav>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(390px,0.72fr)] lg:gap-16 xl:gap-24">
          <div className={`grid gap-3 ${gallery.length > 1 ? "sm:grid-cols-[80px_minmax(0,1fr)]" : ""}`}>
            {gallery.length > 1 ? (
              <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col" role="list" aria-label="Product images">
                {gallery.slice(0, 6).map((image, index) => (
                  <button key={image.id} type="button" onClick={() => setActiveImage(index)} aria-label={`Show image ${index + 1}`} aria-current={activeImage === index} className={`relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-[color:var(--canvas-deep)] transition sm:w-20 ${activeImage === index ? "ring-2 ring-[color:var(--ink)] ring-offset-2" : "opacity-65 hover:opacity-100"}`}>
                    <AssetImage src={resolveAssetUrl(image.url)} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            ) : null}

            <button ref={zoomTriggerRef} type="button" onClick={() => setZoomOpen(true)} className="group relative order-1 aspect-square overflow-hidden rounded-[28px] bg-[color:var(--canvas-deep)] sm:order-2" aria-label={`Enlarge image of ${product.name}`}>
              <AssetImage src={resolveAssetUrl(gallery[activeImage]?.url)} alt={product.name} fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-contain p-3 transition duration-700 ease-out group-hover:scale-[1.025] sm:p-6" />
              <span className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[color:var(--ink)] shadow-sm backdrop-blur transition group-hover:scale-105"><Expand size={17} /></span>
              {discount ? <span className="absolute left-4 top-4 rounded-full bg-[color:var(--ink)] px-3 py-1.5 text-xs font-bold text-white">Save {discount}%</span> : null}
            </button>
          </div>

          <div className="lg:sticky lg:top-[var(--sticky-shell-offset)] lg:transition-[top] lg:duration-300">
            <div className="flex items-center gap-3">
              <BrandMark name={product.brand?.name} className="h-10 w-10" />
              <div><p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">{product.brand?.name || "DukaanHub"}</p><p className="mt-0.5 text-xs text-[color:var(--muted-light)]">SKU {product.sku}</p></div>
            </div>

            <h1 className="mt-6 text-4xl font-semibold leading-[1.04] tracking-[-0.055em] text-[color:var(--ink)] sm:text-5xl">{product.name}</h1>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold"><Star size={15} className="fill-amber-400 text-amber-400" /> {product.rating ? product.rating.toFixed(1) : "New"}</span>
              <span className="text-[color:var(--muted)]">{product.review_count} customer reviews</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock > 0 ? "bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]" : "bg-red-50 text-[color:var(--danger)]"}`}>{product.stock > 0 ? "In stock" : "Out of stock"}</span>
            </div>

            <div className="mt-7 rounded-[20px] bg-[color:var(--canvas-deep)] p-5 sm:p-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-semibold tracking-[-0.045em] text-[color:var(--ink)]">{formatCurrency(product.price)}</span>
                {product.compare_at_price ? <span className="text-sm text-[color:var(--muted-light)] line-through">{formatCurrency(product.compare_at_price)}</span> : null}
                {discount ? <span className="text-sm font-semibold text-[color:var(--accent-dark)]">Save {formatCurrency((product.compare_at_price || product.price) - product.price)}</span> : null}
              </div>
              <p className="mt-2 text-sm text-[color:var(--muted)]">Available payment methods are confirmed at checkout.</p>
            </div>

            <p className="mt-7 text-[0.95rem] leading-7 text-[color:var(--muted)]">{product.description}</p>
            <div className="mt-8"><ProductActions productId={product.id} stock={product.stock} /></div>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-[color:var(--line)] pt-7">
              {serviceItems.map(({ icon: Icon, title, detail }) => <div key={title} className="flex gap-3"><Icon size={18} className="mt-0.5 shrink-0 text-[color:var(--accent)]" /><div><p className="text-sm font-semibold text-[color:var(--ink)]">{title}</p><p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{detail}</p></div></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12 bg-[color:var(--canvas-deep)] py-16 md:mt-24 md:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <div><p className="eyebrow">Made to be understood</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.045em] sm:text-5xl">Everything worth knowing, without the fine-print maze.</h2></div>
          <div className="divide-y divide-[color:var(--line-dark)] border-y border-[color:var(--line-dark)]">
            <details open className="group py-6"><summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold">Product specifications <span className="text-xl font-light transition group-open:rotate-45">+</span></summary><div className="mt-5 grid gap-3 sm:grid-cols-2">{specifications.length ? specifications.map((item) => { const [label, ...rest] = item.split(":"); return <div key={item} className="rounded-xl bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--muted-light)]">{rest.length ? label : "Detail"}</p><p className="mt-2 text-sm font-medium">{rest.length ? rest.join(":").trim() : item}</p></div>; }) : <p className="text-sm text-[color:var(--muted)]">Specifications are being prepared.</p>}</div></details>
            <details className="group py-6"><summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold">Delivery & returns <span className="text-xl font-light transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">{deliveryEstimate ? `${deliveryEstimate}. ` : "The delivery estimate and fee are confirmed at checkout. "}{returns ? `${returns}.` : "Return eligibility follows the DukaanHub return policy."}</p></details>
            <details className="group py-6"><summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold">Payments & protection <span className="text-xl font-light transition group-open:rotate-45">+</span></summary><p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">Choose from the payment methods available at checkout. Your order and payment status stay visible in your account.</p></details>
          </div>
        </div>
      </section>

      {related.length ? <section className="container-page py-16 md:py-24"><div className="mb-8 flex items-end justify-between"><div><p className="eyebrow">Continue exploring</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">You may also like</h2></div>{product.category ? <Link href={`/category/${product.category.slug}`} className="hidden text-sm font-semibold sm:block">View category <ChevronRight size={15} className="ml-1 inline" /></Link> : null}</div><ProductGrid products={related} /></section> : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[color:var(--line)] bg-white/94 p-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(10,12,10,0.08)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{product.name}</p><p className="mt-0.5 text-sm font-semibold">{formatCurrency(product.price)}</p></div>
          <div className="w-36"><ProductActions productId={product.id} stock={product.stock} compact showWishlist={false} /></div>
        </div>
      </div>

      <AnimatePresence>{zoomOpen ? <motion.div className="fixed inset-0 z-[110] flex items-center justify-center bg-white p-4 sm:p-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`Enlarged image of ${product.name}`}><button ref={zoomCloseRef} type="button" onClick={() => setZoomOpen(false)} className="absolute right-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--canvas-deep)]" aria-label="Close image"><X size={19} /></button><div className="relative h-full w-full max-w-6xl"><AssetImage src={resolveAssetUrl(gallery[activeImage]?.url)} alt={product.name} fill sizes="100vw" className="object-contain" /></div></motion.div> : null}</AnimatePresence>
    </div>
  );
}
