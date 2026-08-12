"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { Check, ChevronRight, CircleAlert, Clock3, Headphones, Home, PackageCheck, PackageOpen, PackageSearch, Search, ShieldCheck, Truck } from "lucide-react";

import { CommerceBreadcrumb } from "@/components/commerce/commerce-primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { cn, formatCurrency } from "@/lib/utils";

type TrackedOrder = {
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  tax: number;
  shipping_charges: number;
  discount_amount: number;
  total_amount: number;
  items?: Array<{
    id: number;
    product_name: string;
    product_sku?: string;
    unit_price: number;
    quantity: number;
    total_price?: number;
  }>;
};

const stages = [
  { key: "pending", label: "Order placed", copy: "We have received it.", icon: Clock3 },
  { key: "confirmed", label: "Confirmed", copy: "Details are checked.", icon: PackageCheck },
  { key: "packed", label: "Packed", copy: "Your items are ready.", icon: PackageOpen },
  { key: "shipped", label: "On the way", copy: "It is with the courier.", icon: Truck },
  { key: "delivered", label: "Delivered", copy: "Arrived at its destination.", icon: Home }
] as const;

const statusAliases: Record<string, string> = { processing: "packed", paid: "confirmed" };

function readable(value?: string) {
  if (!value) return "Not available";
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function TrackOrderPage() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const track = async (orderNumber: string) => {
    const normalizedCode = orderNumber.trim();
    if (!normalizedCode) {
      setError("Enter the order number from your confirmation message.");
      return;
    }

    setBusy(true);
    setError("");
    setSearched(true);
    try {
      const response = await api.get(`/orders/track/${encodeURIComponent(normalizedCode)}`);
      if (!response.data?.order_number) throw new Error("Order not found");
      setOrder(response.data);
      setCode(response.data.order_number);
    } catch {
      setOrder(null);
      setError("We could not find an order with that number. Check the reference and try again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const orderNumber = new URLSearchParams(window.location.search).get("order");
    if (orderNumber) {
      setCode(orderNumber);
      track(orderNumber);
    }
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    track(code);
  };

  const normalizedStatus = order ? (statusAliases[order.status.toLowerCase()] || order.status.toLowerCase()) : "";
  const currentStage = Math.max(0, stages.findIndex((stage) => stage.key === normalizedStatus));
  const cancelled = normalizedStatus === "cancelled";

  return (
    <div className="pb-20 md:pb-28">
      <section className="container-page pt-6 sm:pt-8">
        <CommerceBreadcrumb current="Track order" />

        <div className="relative mt-5 overflow-hidden rounded-[30px] bg-[color:var(--canvas-deep)] px-6 py-10 sm:px-10 sm:py-14 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16 lg:px-14 lg:py-16">
          <div aria-hidden="true" className="absolute -right-20 -top-28 size-80 rounded-full border border-white bg-white/40" />
          <div className="relative">
            <p className="eyebrow">Delivery, made visible</p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold tracking-[-0.06em] text-[color:var(--ink)] sm:text-6xl lg:text-7xl">Know where your order is.</h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-[color:var(--muted)] sm:text-base">Enter the reference from your confirmation to see each delivery milestone and the complete order summary.</p>
          </div>

          <div className="relative mt-10 rounded-[24px] bg-white p-5 shadow-[var(--shadow)] sm:p-7 lg:mt-0">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]"><PackageSearch size={19} /></span>
              <div><h2 className="text-base font-semibold text-[color:var(--ink)]">Track an order</h2><p className="mt-0.5 text-xs text-[color:var(--muted)]">No account sign-in required</p></div>
            </div>
            <form onSubmit={submit} className="mt-5 space-y-3">
              <label className="relative block">
                <span className="sr-only">Order number</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" size={17} />
                <Input value={code} onChange={(event) => setCode(event.target.value)} placeholder="DH-XXXXXXXXXX" autoComplete="off" className="min-h-14 pl-11 uppercase tracking-wide" aria-invalid={Boolean(error)} aria-describedby={error ? "tracking-error" : "order-hint"} />
              </label>
              <Button type="submit" disabled={busy} className="min-h-12 w-full">{busy ? "Checking your order…" : "Show delivery status"}</Button>
            </form>
            {error ? <p id="tracking-error" role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-[color:var(--danger)]"><CircleAlert size={16} className="mt-1 shrink-0" /> {error}</p> : null}
            {!searched ? <p id="order-hint" className="mt-4 text-xs leading-5 text-[color:var(--muted)]">Your order number starts with <span className="font-semibold text-[color:var(--ink)]">DH-</span>. Find it in your confirmation or <Link href="/account/orders" className="font-semibold text-[color:var(--accent-dark)]">order history</Link>.</p> : null}
          </div>
        </div>

        {order ? (
          <div className="mt-10 space-y-8" aria-live="polite">
            <section className="overflow-hidden rounded-[24px] bg-white shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055]" aria-labelledby="tracking-result-title">
              <div className="flex flex-col gap-5 border-b border-[color:var(--line)] px-5 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-7">
                <div>
                  <p className="eyebrow">Order reference</p>
                  <h2 id="tracking-result-title" className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[color:var(--ink)]">{order.order_number}</h2>
                </div>
                <span className={cn("inline-flex min-h-9 w-fit items-center gap-2 rounded-full px-3.5 text-xs font-semibold", cancelled ? "bg-red-50 text-[color:var(--danger)]" : normalizedStatus === "delivered" ? "bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]" : "bg-[color:var(--accent)] text-white")}>
                  {cancelled ? <CircleAlert size={14} /> : <Check size={14} />} {readable(order.status)}
                </span>
              </div>

              {cancelled ? (
                <div className="m-5 rounded-2xl bg-red-50 p-5 sm:m-8">
                  <p className="font-semibold text-[color:var(--danger)]">This order was cancelled</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-red-800">For questions about the cancellation or payment status, share the order number above with customer care.</p>
                  <Link href="/contact" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-red-900">Contact customer care <ChevronRight size={15} className="ml-1" /></Link>
                </div>
              ) : (
                <ol className="grid gap-0 px-7 py-8 sm:grid-cols-5 sm:px-8 sm:py-10" aria-label={`Order status: ${readable(order.status)}`}>
                  {stages.map((stage, index) => {
                    const complete = index <= currentStage;
                    const Icon = stage.icon;
                    return (
                      <li key={stage.key} className={cn("relative border-l pb-8 pl-8 last:pb-0 sm:border-l-0 sm:border-t sm:pb-0 sm:pl-0 sm:pr-4 sm:pt-8", complete ? "border-[color:var(--accent)]" : "border-[color:var(--line-dark)]")}>
                        <span className={cn("absolute -left-5 -top-1 grid size-10 place-items-center rounded-full ring-4 ring-white sm:-top-5 sm:left-0", complete ? "bg-[color:var(--accent)] text-white" : "bg-[color:var(--canvas-deep)] text-[color:var(--muted)]")}>
                          {complete && index < currentStage ? <Check size={17} /> : <Icon size={17} />}
                        </span>
                        <p className={cn("text-sm font-semibold", complete ? "text-[color:var(--ink)]" : "text-[color:var(--muted)]")}>{stage.label}</p>
                        <p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">{index === currentStage ? "Current status" : stage.copy}</p>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-[color:var(--line)] px-5 py-5 sm:px-7"><div><p className="eyebrow">Contents</p><h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[color:var(--ink)]">Items in this order</h2></div><PackageOpen size={20} className="text-[color:var(--muted)]" /></div>
                <div className="divide-y divide-[color:var(--line)]">
                  {(order.items || []).map((item) => (
                    <div key={item.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-5 px-5 py-5 sm:px-7">
                      <div><p className="font-semibold leading-6 text-[color:var(--ink)]">{item.product_name}</p><p className="mt-1 text-xs text-[color:var(--muted)]">{item.product_sku ? `SKU ${item.product_sku} · ` : ""}Quantity {item.quantity}</p></div>
                      <p className="font-semibold tabular-nums text-[color:var(--ink)]">{formatCurrency(item.total_price ?? item.unit_price * item.quantity)}</p>
                    </div>
                  ))}
                  {!order.items?.length ? <p className="px-5 py-8 text-sm text-[color:var(--muted)] sm:px-7">Item details are not available for this order.</p> : null}
                </div>
              </Card>

              <aside className="space-y-4">
                <Card className="p-6 sm:p-7">
                  <p className="eyebrow">Payment</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[color:var(--ink)]">Order summary</h2>
                  <dl className="mt-6 space-y-3.5 text-sm text-[color:var(--muted)]">
                    <div className="flex justify-between gap-4"><dt>Payment method</dt><dd className="font-medium text-[color:var(--ink)]">{readable(order.payment_method)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Payment status</dt><dd className="font-medium text-[color:var(--ink)]">{readable(order.payment_status)}</dd></div>
                    <div className="flex justify-between gap-4 border-t border-[color:var(--line)] pt-4"><dt>Subtotal</dt><dd>{formatCurrency(order.subtotal || 0)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Tax</dt><dd>{formatCurrency(order.tax || 0)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Delivery</dt><dd>{formatCurrency(order.shipping_charges || 0)}</dd></div>
                    {order.discount_amount ? <div className="flex justify-between gap-4 text-[color:var(--accent-dark)]"><dt>Discount</dt><dd>-{formatCurrency(order.discount_amount)}</dd></div> : null}
                    <div className="flex items-baseline justify-between gap-4 border-t border-[color:var(--line)] pt-5"><dt className="font-semibold text-[color:var(--ink)]">Total</dt><dd className="text-2xl font-semibold tracking-[-0.035em] text-[color:var(--ink)]">{formatCurrency(order.total_amount || 0)}</dd></div>
                  </dl>
                </Card>
                <Link href="/contact" className="group flex min-h-20 items-center gap-3 rounded-2xl bg-[color:var(--canvas-deep)] p-4 transition hover:bg-[#f0f3f0]">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[color:var(--accent-dark)]"><Headphones size={17} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[color:var(--ink)]">Need help with this order?</span><span className="mt-0.5 block text-xs text-[color:var(--muted)]">Customer care is ready to help.</span></span>
                  <ChevronRight size={16} className="text-[color:var(--muted)] transition group-hover:translate-x-0.5" />
                </Link>
              </aside>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: PackageCheck, title: "Order confirmed", copy: "We check your items and delivery details." },
              { icon: Truck, title: "Courier updates", copy: "Follow progress when your parcel leaves us." },
              { icon: ShieldCheck, title: "Support on hand", copy: "Share your reference if you need assistance." }
            ].map((item) => <div key={item.title} className="rounded-2xl bg-white p-5 ring-1 ring-black/[0.055]"><item.icon size={18} className="text-[color:var(--accent)]" /><h2 className="mt-4 text-sm font-semibold text-[color:var(--ink)]">{item.title}</h2><p className="mt-1.5 text-xs leading-5 text-[color:var(--muted)]">{item.copy}</p></div>)}
          </div>
        )}
      </section>
    </div>
  );
}
