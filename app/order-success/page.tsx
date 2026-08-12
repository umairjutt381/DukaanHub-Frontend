import Link from "next/link";
import { ArrowRight, Check, Clock3, PackageCheck, ShoppingBag, Truck } from "lucide-react";

import { CheckoutProgress, CommerceBreadcrumb, CommerceTrustStrip } from "@/components/commerce/commerce-primitives";

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const trackingHref = order ? `/track-order?order=${encodeURIComponent(order)}` : "/track-order";

  return (
    <div className="pb-20 md:pb-28">
      <section className="container-page pt-6 sm:pt-8" aria-labelledby="order-success-title">
        <CommerceBreadcrumb current="Order confirmed" />
        <div className="mt-5 flex justify-end border-b border-[color:var(--line)] pb-8"><CheckoutProgress current={3} /></div>

        <div className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-[30px] bg-[color:var(--canvas-deep)] px-6 py-12 text-center sm:px-12 sm:py-16">
          <div aria-hidden="true" className="absolute left-1/2 top-0 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-3xl" />
          <div className="relative">
            <span className="mx-auto grid size-16 place-items-center rounded-[20px] bg-[color:var(--accent)] text-white shadow-[0_18px_44px_rgba(11,143,58,0.22)]"><Check size={29} strokeWidth={2.2} /></span>
            <p className="eyebrow mt-7">Order confirmed</p>
            <h1 id="order-success-title" className="mx-auto mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-[color:var(--ink)] sm:text-6xl">Thank you. We’ll take it from here.</h1>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">Your order is confirmed. You can follow every milestone from preparation to delivery using the reference below.</p>
            {order ? (
              <div className="mx-auto mt-8 w-fit min-w-64 rounded-2xl bg-white px-6 py-4 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.04]">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.13em] text-[color:var(--muted)]">Order number</p>
                <p className="mt-1.5 text-xl font-semibold tracking-[0.02em] text-[color:var(--ink)]">{order}</p>
              </div>
            ) : null}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={trackingHref} className="group inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-[color:var(--accent-dark)]">Track this order <ArrowRight size={16} className="ml-2 transition group-hover:translate-x-0.5" /></Link>
              <Link href="/account/orders" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[color:var(--ink)] ring-1 ring-black/[0.07] transition hover:ring-black/20">View order history</Link>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: PackageCheck, step: "01", title: "Order review", copy: "We check your products and delivery details before preparation." },
              { icon: Clock3, step: "02", title: "Preparation", copy: "Your items are gathered and prepared for a safe journey." },
              { icon: Truck, step: "03", title: "Delivery", copy: "Track the courier once your order is on the way." }
            ].map((item) => (
              <div key={item.step} className="rounded-[20px] bg-white p-5 ring-1 ring-black/[0.055] sm:p-6">
                <div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]"><item.icon size={18} /></span><span className="text-xs font-semibold text-[color:var(--muted-light)]">{item.step}</span></div>
                <h2 className="mt-5 text-base font-semibold tracking-[-0.015em] text-[color:var(--ink)]">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.copy}</p>
              </div>
            ))}
          </div>
          <div className="mt-6"><CommerceTrustStrip /></div>
          <Link href="/products" className="mx-auto mt-8 flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--ink)]"><ShoppingBag size={15} /> Continue shopping</Link>
        </div>
      </section>
    </div>
  );
}
