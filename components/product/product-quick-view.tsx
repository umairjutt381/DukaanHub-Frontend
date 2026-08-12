"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Star, Truck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { AssetImage } from "@/components/ui/asset-image";
import { BrandMark } from "@/components/product/brand-mark";
import { ProductActions } from "@/components/product/product-actions";
import { shippingEstimate } from "@/lib/product-insights";
import type { Product } from "@/lib/types";
import { formatCurrency, resolveAssetUrl } from "@/lib/utils";

export function ProductQuickView({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const image = resolveAssetUrl(product.images?.find((item) => item.is_primary)?.url || product.images?.[0]?.url);
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;
  const deliveryEstimate = shippingEstimate(product);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button type="button" className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-sm" onClick={onClose} aria-label="Close quick view" />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`quick-view-${product.id}`}
            initial={{ opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.99 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-t-[28px] bg-white shadow-[var(--shadow-strong)] sm:rounded-[28px]"
          >
            <button ref={closeRef} type="button" onClick={onClose} className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-[color:var(--ink)] shadow-sm backdrop-blur transition hover:scale-105" aria-label="Close quick view">
              <X size={19} />
            </button>

            <div className="grid md:grid-cols-[1.02fr_0.98fr]">
              <div className="relative min-h-[360px] overflow-hidden rounded-t-[28px] bg-[color:var(--canvas-deep)] md:min-h-[640px] md:rounded-l-[28px] md:rounded-tr-none">
                <AssetImage src={image} alt={product.name} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-5 sm:p-8" />
                {discount ? <span className="absolute left-5 top-5 rounded-full bg-[color:var(--ink)] px-3 py-1.5 text-xs font-bold text-white">Save {discount}%</span> : null}
              </div>

              <div className="flex flex-col p-6 sm:p-8 md:p-10">
                <div className="flex items-center gap-3">
                  <BrandMark name={product.brand?.name} />
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">{product.brand?.name || "DukaanHub"}</span>
                </div>
                <h2 id={`quick-view-${product.id}`} className="mt-6 text-3xl font-semibold leading-[1.08] tracking-[-0.045em] text-[color:var(--ink)] sm:text-4xl">{product.name}</h2>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 font-semibold"><Star size={15} className="fill-amber-400 text-amber-400" /> {product.rating ? product.rating.toFixed(1) : "New"}</span>
                  <span className="text-[color:var(--muted)]">({product.review_count} reviews)</span>
                  <span className="text-[color:var(--line-dark)]">•</span>
                  <span className={product.stock > 0 ? "text-[color:var(--accent-dark)]" : "text-[color:var(--danger)]"}>{product.stock > 0 ? "In stock" : "Out of stock"}</span>
                </div>
                <p className="mt-6 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">{formatCurrency(product.price)}</p>
                {product.compare_at_price ? <p className="mt-1 text-sm text-[color:var(--muted-light)] line-through">{formatCurrency(product.compare_at_price)}</p> : null}
                <p className="mt-7 line-clamp-4 text-sm leading-7 text-[color:var(--muted)]">{product.description}</p>

                <div className="mt-8"><ProductActions productId={product.id} stock={product.stock} /></div>

                <div className="mt-8 grid grid-cols-2 gap-3 text-xs text-[color:var(--muted)]">
                  <span className="flex items-center gap-2"><Truck size={16} className="text-[color:var(--accent)]" /> {deliveryEstimate || "Estimate at checkout"}</span>
                  <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-[color:var(--accent)]" /> Secure checkout</span>
                </div>

                <Link href={`/product/${product.slug}`} onClick={onClose} className="mt-auto flex min-h-12 items-center justify-between border-t border-[color:var(--line)] pt-8 text-sm font-semibold text-[color:var(--ink)]">
                  View full product details <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
