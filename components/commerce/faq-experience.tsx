"use client";

import Link from "next/link";
import { ArrowRight, CircleHelp, Plus, Search, X } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

type FaqCategory = "All" | "Orders" | "Payment" | "Delivery" | "Returns" | "Account";

const categories: FaqCategory[] = ["All", "Orders", "Payment", "Delivery", "Returns", "Account"];

const faqs: Array<{ category: Exclude<FaqCategory, "All">; question: string; answer: string }> = [
  { category: "Orders", question: "How do I place an order?", answer: "Choose a product, add it to your bag, then sign in and complete checkout with your delivery and payment details." },
  { category: "Orders", question: "Where can I find my order number?", answer: "Your reference begins with DH- and appears after checkout. Signed-in customers can also find it in their order history." },
  { category: "Orders", question: "Can I change an order after placing it?", answer: "Contact customer care as soon as possible with your order number. Whether a change is possible depends on how far the order has progressed." },
  { category: "Orders", question: "What happens when a product is out of stock?", answer: "Products that are currently unavailable cannot be added to the bag. You can save the product and check again later." },
  { category: "Payment", question: "Which payment methods are supported?", answer: "Checkout includes cash on delivery, JazzCash, Easypaisa and card payment options where enabled for the order." },
  { category: "Payment", question: "When do I see the complete total?", answer: "The order summary shows the subtotal, tax, delivery charge and final total before you place the order." },
  { category: "Payment", question: "How do I use a coupon code?", answer: "Enter an eligible code in the coupon field during checkout. Any applicable discount will be reflected by the order service." },
  { category: "Delivery", question: "Can I track my order without signing in?", answer: "Yes. Enter the DH- order number on the Track Order page to see the current fulfillment status." },
  { category: "Delivery", question: "How will I know when my order ships?", answer: "The tracking page moves through order placed, confirmed, packed, on the way and delivered as updates become available." },
  { category: "Delivery", question: "Where are delivery charges shown?", answer: "The delivery charge appears in your bag and again in the checkout summary before the order is submitted." },
  { category: "Returns", question: "How do returns work?", answer: "Eligibility depends on the product condition and the applicable return policy. Review the policy before beginning a request." },
  { category: "Returns", question: "How do I start a return or refund request?", answer: "Contact customer care with your order number, the product involved and a clear description of the issue." },
  { category: "Returns", question: "What if an item arrives with a problem?", answer: "Send customer care your order reference and details about the item as soon as possible so the team can review the situation." },
  { category: "Account", question: "Do I need an account to check out?", answer: "Yes. Signing in connects your bag to the secure checkout and keeps your order history available in one place." },
  { category: "Account", question: "Why should I use a wishlist?", answer: "A wishlist keeps products tied to your account so you can revisit your shortlist from another device." },
  { category: "Account", question: "What if I forget my password?", answer: "Use the Forgot Password link on the sign-in page and follow the reset steps for your account." }
];

export function FaqExperience() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FaqCategory>("All");

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return faqs.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesQuery = !normalizedQuery || `${item.question} ${item.answer} ${item.category}`.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <>
      <div className="mx-auto -mt-7 max-w-3xl px-4 sm:-mt-8">
        <label className="relative block rounded-2xl bg-white p-2 shadow-[var(--shadow)] ring-1 ring-black/[0.05]">
          <span className="sr-only">Search frequently asked questions</span>
          <Search size={19} className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-[color:var(--muted)]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search orders, delivery, returns…" className="min-h-14 w-full rounded-xl bg-[color:var(--canvas-deep)] py-3 pl-12 pr-12 text-sm text-[color:var(--ink)] outline-none placeholder:text-[color:var(--muted-light)] focus:ring-2 focus:ring-[color:var(--accent)]" />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear FAQ search" className="absolute right-5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-[color:var(--muted)] transition hover:bg-[color:var(--line)] hover:text-[color:var(--ink)]"><X size={16} /></button> : null}
        </label>
      </div>

      <div className="mt-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="FAQ categories">
        {categories.map((item) => (
          <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={cn("min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition", category === item ? "bg-[color:var(--accent)] text-white" : "bg-[color:var(--canvas-deep)] text-[color:var(--muted)] hover:text-[color:var(--accent-dark)]")}>
            {item}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
        <aside className="h-fit lg:sticky lg:top-[var(--sticky-shell-offset)] lg:transition-[top] lg:duration-300">
          <p className="eyebrow">{category === "All" ? "All topics" : category}</p>
          <p className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[color:var(--ink)]">{results.length} answer{results.length === 1 ? "" : "s"}</p>
          <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">Open a question for a concise answer, or search using a phrase from your issue.</p>
        </aside>

        <div aria-live="polite">
          {results.length ? (
            <div className="divide-y divide-[color:var(--line)] border-y border-[color:var(--line)]">
              {results.map((item) => (
                <details key={item.question} className="group">
                  <summary className="flex min-h-[76px] cursor-pointer list-none items-center justify-between gap-6 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]">
                    <span><span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[color:var(--accent-dark)]">{item.category}</span><span className="block text-base font-semibold leading-6 tracking-[-0.015em] text-[color:var(--ink)] sm:text-lg">{item.question}</span></span>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[color:var(--canvas-deep)] text-[color:var(--ink)] transition group-open:rotate-45 group-open:bg-[color:var(--accent)] group-open:text-white"><Plus size={16} /></span>
                  </summary>
                  <div className="pb-6 pr-14"><p className="max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">{item.answer}</p></div>
                </details>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] bg-[color:var(--canvas-deep)] px-6 py-14 text-center sm:px-10">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-[color:var(--ink)]"><CircleHelp size={21} /></span>
              <h2 className="mt-5 text-2xl font-semibold tracking-[-0.035em] text-[color:var(--ink)]">No matching answer yet.</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[color:var(--muted)]">Try a shorter phrase, choose another topic, or send customer care the details.</p>
              <button type="button" onClick={() => { setQuery(""); setCategory("All"); }} className="mt-6 min-h-11 text-sm font-semibold text-[color:var(--accent-dark)]">Clear filters</button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-[24px] bg-[color:var(--ink)] px-6 py-8 text-white sm:flex-row sm:items-center sm:px-8 sm:py-10">
        <div><p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Need a different answer?</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.035em]">Customer care can take it from here.</h2><p className="mt-2 text-sm text-white/55">Share your order reference and the details that matter.</p></div>
        <Link href="/contact" className="group inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--accent-wash)]">Contact customer care <ArrowRight size={15} className="ml-2 transition group-hover:translate-x-0.5" /></Link>
      </div>
    </>
  );
}
