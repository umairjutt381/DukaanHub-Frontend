import Link from "next/link";
import { ArrowLeft, CircleAlert, CreditCard, Headphones, RefreshCw, ShoppingBag } from "lucide-react";

import { CheckoutProgress, CommerceBreadcrumb } from "@/components/commerce/commerce-primitives";

export default async function OrderFailedPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;

  return (
    <div className="pb-20 md:pb-28">
      <section className="container-page pt-6 sm:pt-8" aria-labelledby="order-failed-title">
        <CommerceBreadcrumb current="Order not completed" />
        <div className="mt-5 flex justify-end border-b border-[color:var(--line)] pb-8"><CheckoutProgress current={2} /></div>

        <div className="mx-auto mt-10 grid max-w-5xl overflow-hidden rounded-[30px] bg-[color:var(--canvas-deep)] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
            <div aria-hidden="true" className="absolute -left-24 -top-24 size-64 rounded-full bg-white/65 blur-3xl" />
            <div className="relative">
              <span className="grid size-14 place-items-center rounded-2xl bg-white text-[color:var(--danger)] shadow-[var(--shadow-xs)]"><CircleAlert size={25} /></span>
              <p className="mt-7 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--danger)]">Order not completed</p>
              <h1 id="order-failed-title" className="mt-4 max-w-xl text-5xl font-semibold tracking-[-0.06em] text-[color:var(--ink)] sm:text-6xl">That did not go through.</h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-[color:var(--muted)] sm:text-base">Your order has not been confirmed. Review your bag and delivery information, then return when you are ready to try again.</p>
              {order ? <div className="mt-7 w-fit rounded-xl bg-white px-4 py-3 text-xs text-[color:var(--muted)] ring-1 ring-black/[0.04]">Reference <span className="ml-2 font-semibold text-[color:var(--ink)]">{order}</span></div> : null}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/checkout" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]"><RefreshCw size={15} className="mr-2" /> Try checkout again</Link>
                <Link href="/cart" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[color:var(--ink)] ring-1 ring-black/[0.07] transition hover:ring-black/20"><ArrowLeft size={15} className="mr-2" /> Review bag</Link>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-10 lg:m-2 lg:rounded-[24px] lg:p-12">
            <p className="eyebrow">A quick check</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">Before you try again</h2>
            <div className="mt-7 divide-y divide-[color:var(--line)]">
              {[
                { icon: ShoppingBag, title: "Review your bag", copy: "Check quantities and product availability before checkout." },
                { icon: CreditCard, title: "Confirm payment", copy: "Choose your payment preference again and verify its details." },
                { icon: Headphones, title: "Ask for help", copy: "If payment was attempted, support can help verify its status." }
              ].map((item) => (
                <div key={item.title} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color:var(--canvas-deep)] text-[color:var(--ink)]"><item.icon size={17} /></span>
                  <div><p className="text-sm font-semibold text-[color:var(--ink)]">{item.title}</p><p className="mt-1.5 text-sm leading-6 text-[color:var(--muted)]">{item.copy}</p></div>
                </div>
              ))}
            </div>
            <Link href="/contact" className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold text-[color:var(--accent-dark)]">Contact customer care</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
