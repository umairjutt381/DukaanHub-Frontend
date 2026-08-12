"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Minus, PackageCheck, Plus, ShoppingBag, Trash2, Truck } from "lucide-react";

import { CommerceBreadcrumb, CommerceEmptyState, CommerceTrustStrip, CheckoutProgress } from "@/components/commerce/commerce-primitives";
import { BrandMark } from "@/components/product/brand-mark";
import { AssetImage } from "@/components/ui/asset-image";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { api, getProductsByIds } from "@/lib/api/client";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type CartLine = {
  id: number;
  product_id: number;
  quantity: number;
  product?: Product | null;
};

function primaryImage(product?: Product | null) {
  return product?.images?.find((image) => image.is_primary)?.url || product?.images?.[0]?.url;
}

function CartSkeleton() {
  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-16">
      <div className="space-y-5">
        {[0, 1].map((item) => (
          <div key={item} className="grid grid-cols-[112px_minmax(0,1fr)] gap-5 border-b border-[color:var(--line)] pb-6 sm:grid-cols-[144px_minmax(0,1fr)_120px]">
            <Skeleton className="aspect-[4/5] rounded-[20px]" />
            <div className="py-2"><Skeleton className="h-3 w-24" /><Skeleton className="mt-4 h-5 w-3/4" /><Skeleton className="mt-8 h-11 w-36" /></div>
            <Skeleton className="mt-2 hidden h-5 w-24 justify-self-end sm:block" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[430px] rounded-[24px]" />
    </div>
  );
}

export default function CartPage() {
  const localItems = useCartStore((state) => state.items);
  const addLocalItem = useCartStore((state) => state.add);
  const setLocalQuantity = useCartStore((state) => state.setQuantity);
  const removeLocalItem = useCartStore((state) => state.remove);
  const [remoteCart, setRemoteCart] = useState<any>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { notify } = useToast();

  const loadRemoteCart = useCallback(async () => {
    try {
      const response = await api.get("/cart");
      setRemoteCart(response.data);
      return response.data;
    } catch {
      setRemoteCart(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadCart = async () => {
      const nextRemoteCart = await loadRemoteCart();
      const remoteItems = (nextRemoteCart?.items || []) as CartLine[];

      // The header count is backed by the persisted local store. Once an
      // authenticated cart exists, mirror its quantities locally so both
      // surfaces stay consistent. Equality checks keep this effect stable.
      if (remoteItems.length) {
        const remoteQuantities = new Map(remoteItems.map((item) => [item.product_id, item.quantity]));
        remoteItems.forEach((item) => {
          const localItem = localItems.find((candidate) => candidate.product_id === item.product_id);
          if (!localItem) addLocalItem(item.product_id, item.quantity);
          else if (localItem.quantity !== item.quantity) setLocalQuantity(item.product_id, item.quantity);
        });
        localItems.forEach((item) => {
          if (!remoteQuantities.has(item.product_id)) removeLocalItem(item.product_id);
        });
      }
      const productIds = [
        ...(nextRemoteCart?.items || []).map((item: CartLine) => item.product_id),
        ...localItems.map((item) => item.product_id)
      ];

      try {
        const products = await getProductsByIds(productIds);
        if (active) setCatalog(products);
      } catch {
        if (active) setCatalog([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCart();
    return () => {
      active = false;
    };
  }, [addLocalItem, loadRemoteCart, localItems, removeLocalItem, setLocalQuantity]);

  const items = useMemo<CartLine[]>(() => {
    if (remoteCart?.items?.length) {
      return remoteCart.items.map((item: CartLine) => {
        const catalogProduct = catalog.find((product) => product.id === item.product_id);
        return {
          ...item,
          product: catalogProduct ? { ...catalogProduct, ...(item.product || {}), images: catalogProduct.images } : item.product
        };
      });
    }

    return localItems.map((item) => ({
      id: item.product_id,
      product_id: item.product_id,
      quantity: item.quantity,
      product: catalog.find((product) => product.id === item.product_id)
    }));
  }, [catalog, localItems, remoteCart]);

  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const subtotal = remoteCart?.subtotal ?? items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);
  const tax = remoteCart?.tax ?? subtotal * 0.05;
  const shipping = items.length ? (remoteCart?.shipping ?? 250) : 0;
  const total = items.length ? (remoteCart?.total ?? subtotal + tax + shipping) : 0;
  const isRemoteCart = Boolean(remoteCart?.items?.length);

  const changeQuantity = async (item: CartLine, delta: number) => {
    const nextQuantity = item.quantity + delta;
    if (!isRemoteCart) {
      if (nextQuantity <= 0) removeLocalItem(item.product_id);
      else setLocalQuantity(item.product_id, nextQuantity);
      return;
    }

    setUpdatingId(item.id);
    try {
      if (nextQuantity <= 0) {
        await api.delete(`/cart/items/${item.id}`);
        removeLocalItem(item.product_id);
      } else {
        await api.patch(`/cart/items/${item.id}`, null, { params: { quantity: nextQuantity } });
        const localItem = localItems.find((candidate) => candidate.product_id === item.product_id);
        if (localItem) setLocalQuantity(item.product_id, nextQuantity);
        else addLocalItem(item.product_id, nextQuantity);
      }
      await loadRemoteCart();
      window.dispatchEvent(new Event("dukaanhub:cart-changed"));
    } catch (error: any) {
      notify("Cart update failed", error?.response?.data?.detail || "Unable to update this item.");
    } finally {
      setUpdatingId(null);
    }
  };

  const removeItem = async (item: CartLine) => {
    if (!isRemoteCart) {
      removeLocalItem(item.product_id);
      return;
    }

    setUpdatingId(item.id);
    try {
      await api.delete(`/cart/items/${item.id}`);
      removeLocalItem(item.product_id);
      await loadRemoteCart();
      window.dispatchEvent(new Event("dukaanhub:cart-changed"));
      notify("Item removed", "Your bag has been updated.");
    } catch (error: any) {
      notify("Cart update failed", error?.response?.data?.detail || "Unable to remove this item.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="pb-20 md:pb-28">
      <section className="container-page pt-6 sm:pt-8">
        <CommerceBreadcrumb current="Bag" />
        <div className="mt-5 grid gap-8 border-b border-[color:var(--line)] pb-8 md:grid-cols-[minmax(0,1fr)_420px] md:items-end md:pb-10">
          <div>
            <p className="eyebrow">Your selection</p>
            <h1 className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-[color:var(--ink)] sm:text-6xl">Shopping bag</h1>
            <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">
              {loading ? "Gathering your items…" : itemCount ? `${itemCount} item${itemCount === 1 ? "" : "s"} reserved while you review.` : "A considered edit of everything you choose."}
            </p>
          </div>
          <div className="md:justify-self-end"><CheckoutProgress current={1} /></div>
        </div>

        {loading ? <CartSkeleton /> : items.length ? (
          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-16">
            <div className="min-w-0">
              {!remoteCart?.items?.length && localItems.length > 0 ? (
                <div className="mb-7 flex flex-col gap-3 rounded-2xl bg-[color:var(--accent-wash)] px-5 py-4 text-sm text-[color:var(--ink-soft)] sm:flex-row sm:items-center sm:justify-between">
                  <span className="flex items-center gap-2"><PackageCheck size={16} className="text-[color:var(--accent)]" /> Saved on this device for your visit.</span>
                  <Link href="/login?returnTo=%2Fcart" className="font-semibold text-[color:var(--accent-dark)]">Sign in to sync</Link>
                </div>
              ) : null}

              <ul className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]" role="list">
                {items.map((item) => {
                  const product = item.product;
                  const productHref = product?.slug ? `/product/${product.slug}` : "/products";
                  const disabled = updatingId === item.id;
                  return (
                    <li key={`${isRemoteCart ? "remote" : "local"}-${item.id}`}>
                      <article className="grid grid-cols-[112px_minmax(0,1fr)] gap-5 py-6 sm:grid-cols-[144px_minmax(0,1fr)_130px] sm:gap-7 sm:py-8">
                        <Link href={productHref} className="group relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[color:var(--canvas-deep)]">
                          <AssetImage src={primaryImage(product)} alt={product?.name || "Product image"} fill sizes="144px" className="object-contain p-2 transition duration-500 group-hover:scale-[1.04]" />
                        </Link>

                        <div className="flex min-w-0 flex-col py-1">
                          <div className="flex items-center gap-2.5">
                            <BrandMark name={product?.brand?.name} className="size-7" />
                            <p className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--muted)]">{product?.brand?.name || "DukaanHub"}</p>
                          </div>
                          <Link href={productHref} className="mt-3 line-clamp-2 text-base font-semibold leading-6 tracking-[-0.02em] text-[color:var(--ink)] transition hover:text-[color:var(--accent-dark)] sm:text-lg">
                            {product?.name || "Product"}
                          </Link>
                          {product?.sku ? <p className="mt-1.5 text-xs text-[color:var(--muted)]">SKU {product.sku}</p> : null}
                          <p className="mt-3 text-sm font-semibold text-[color:var(--ink)] sm:hidden">{formatCurrency((product?.price || 0) * item.quantity)}</p>

                          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-5">
                            <div className="inline-grid grid-cols-[44px_44px_44px] items-center overflow-hidden rounded-xl bg-[color:var(--canvas-deep)]" aria-label={`Quantity for ${product?.name || "product"}`}>
                              <button type="button" onClick={() => changeQuantity(item, -1)} disabled={disabled} className="grid min-h-11 place-items-center text-[color:var(--muted)] transition hover:bg-[color:var(--line)] hover:text-[color:var(--ink)] disabled:opacity-40" aria-label={`Decrease quantity for ${product?.name || "product"}`}><Minus size={15} /></button>
                              <span className="text-center text-sm font-semibold tabular-nums text-[color:var(--ink)]" aria-live="polite">{item.quantity}</span>
                              <button type="button" onClick={() => changeQuantity(item, 1)} disabled={disabled} className="grid min-h-11 place-items-center text-[color:var(--muted)] transition hover:bg-[color:var(--line)] hover:text-[color:var(--ink)] disabled:opacity-40" aria-label={`Increase quantity for ${product?.name || "product"}`}><Plus size={15} /></button>
                            </div>
                            <button type="button" onClick={() => removeItem(item)} disabled={disabled} className="inline-flex min-h-11 items-center gap-2 rounded-lg px-1 text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--danger)] disabled:opacity-40">
                              <Trash2 size={15} /> Remove
                            </button>
                          </div>
                        </div>

                        <div className="hidden py-1 text-right sm:block">
                          <p className="text-lg font-semibold tracking-[-0.025em] text-[color:var(--ink)]">{formatCurrency((product?.price || 0) * item.quantity)}</p>
                          <p className="mt-1 text-xs text-[color:var(--muted)]">{formatCurrency(product?.price || 0)} each</p>
                          <p className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[color:var(--accent-dark)]"><span className="size-1.5 rounded-full bg-[color:var(--accent)]" /> In stock</p>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/products" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[color:var(--ink)] transition hover:text-[color:var(--accent-dark)]">Continue shopping <ArrowRight size={15} /></Link>
                <p className="inline-flex items-center gap-2 text-xs text-[color:var(--muted)]"><Truck size={15} className="text-[color:var(--accent)]" /> Delivery calculated for your order</p>
              </div>
            </div>

            <aside className="h-fit lg:sticky lg:top-[var(--sticky-shell-offset)] lg:transition-[top] lg:duration-300" aria-label="Order summary">
              <div className="rounded-[24px] bg-[color:var(--canvas-deep)] p-5 sm:p-7">
                <div className="flex items-end justify-between gap-4 border-b border-[color:var(--line-dark)] pb-5">
                  <div><p className="eyebrow">Order summary</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">Your total</h2></div>
                  <span className="text-xs font-medium text-[color:var(--muted)]">{itemCount} item{itemCount === 1 ? "" : "s"}</span>
                </div>
                <dl className="space-y-3.5 py-6 text-sm text-[color:var(--muted)]">
                  <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd className="font-medium text-[color:var(--ink)]">{formatCurrency(subtotal || 0)}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Tax</dt><dd className="font-medium text-[color:var(--ink)]">{formatCurrency(tax || 0)}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Delivery</dt><dd className="font-medium text-[color:var(--ink)]">{formatCurrency(shipping || 0)}</dd></div>
                  <div className="flex items-baseline justify-between gap-4 border-t border-[color:var(--line-dark)] pt-5"><dt className="font-semibold text-[color:var(--ink)]">Total</dt><dd className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">{formatCurrency(total || 0)}</dd></div>
                </dl>
                <Link href="/checkout" className="group inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white shadow-[var(--shadow-xs)] transition duration-200 hover:-translate-y-px hover:bg-[color:var(--accent-dark)] hover:shadow-[var(--shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">
                  Continue to checkout <ArrowRight size={16} className="ml-2 transition group-hover:translate-x-0.5" />
                </Link>
                <p className="mt-4 text-center text-xs leading-5 text-[color:var(--muted)]">Taxes and delivery are included in the total shown.</p>
              </div>
              <div className="mt-4"><CommerceTrustStrip compact /></div>
            </aside>
          </div>
        ) : (
          <CommerceEmptyState icon={ShoppingBag} eyebrow="Your bag" title="Ready when you are." description="Your bag is empty for now. Explore thoughtful products, save the ones you love, and come back here when you are ready.">
            <Link href="/products" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Explore products <ArrowRight size={16} className="ml-2" /></Link>
            <Link href="/deals" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[color:var(--ink)] ring-1 ring-black/[0.07] transition hover:ring-black/20">Shop current offers</Link>
          </CommerceEmptyState>
        )}
      </section>
    </div>
  );
}
