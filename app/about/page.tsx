import Link from "next/link";
import { ArrowRight, BadgeCheck, CreditCard, PackageSearch, Search, ShieldCheck, Sparkles, Truck } from "lucide-react";

import { CommerceBreadcrumb, CommerceTrustStrip } from "@/components/commerce/commerce-primitives";

const principles = [
  { number: "01", icon: Search, title: "Make discovery feel natural", copy: "Clear categories, useful search and honest product information help every choice feel considered." },
  { number: "02", icon: CreditCard, title: "Keep checkout transparent", copy: "Products, quantities and the complete total stay visible before an order is placed." },
  { number: "03", icon: PackageSearch, title: "Stay useful after purchase", copy: "Order references and tracking keep the experience connected beyond checkout." }
];

export default function AboutPage() {
  return (
    <div className="pb-20 md:pb-28">
      <section className="container-page pt-6 sm:pt-8" aria-labelledby="about-title">
        <CommerceBreadcrumb current="About DukaanHub" />

        <div className="mt-5 grid overflow-hidden rounded-[30px] bg-[color:var(--canvas-deep)] lg:min-h-[650px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14 xl:px-16">
            <p className="eyebrow">About DukaanHub</p>
            <h1 id="about-title" className="mt-5 max-w-3xl text-5xl font-semibold tracking-[-0.065em] text-[color:var(--ink)] sm:text-6xl lg:text-7xl">Everyday shopping, thoughtfully connected.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[color:var(--muted)]">DukaanHub brings discovery, product clarity, checkout and delivery updates into one dependable experience—so shopping feels less fragmented and more human.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/products" className="group inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Explore the store <ArrowRight size={16} className="ml-2 transition group-hover:translate-x-0.5" /></Link>
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-[color:var(--ink)] ring-1 ring-black/[0.07] transition hover:ring-black/20">Talk to customer care</Link>
            </div>
          </div>

          <div className="relative min-h-[500px] bg-white p-5 sm:p-8 lg:m-2 lg:min-h-0 lg:rounded-[24px] lg:p-10">
            <div aria-hidden="true" className="absolute right-8 top-8 size-36 rounded-full bg-[color:var(--accent-wash)] blur-2xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent-dark)]"><Sparkles size={14} /> The connected journey</span><span className="grid size-10 place-items-center rounded-xl bg-[color:var(--canvas-deep)] text-[color:var(--ink)]"><BadgeCheck size={18} /></span></div>
              <div className="my-10 space-y-3">
                {[
                  ["01", "Find", "Search and explore without noise."],
                  ["02", "Understand", "See the details that matter."],
                  ["03", "Choose", "Keep favourites and compare options."],
                  ["04", "Follow", "Stay informed after checkout."]
                ].map(([number, title, copy], index) => (
                  <div key={number} className={`group flex items-center gap-4 rounded-2xl p-4 transition ${index === 1 ? "bg-[color:var(--ink)] text-white" : "bg-[color:var(--canvas-deep)] text-[color:var(--ink)]"}`}>
                    <span className={`text-xs font-semibold ${index === 1 ? "text-white/45" : "text-[color:var(--muted-light)]"}`}>{number}</span>
                    <div className="min-w-0 flex-1"><p className="font-semibold tracking-[-0.015em]">{title}</p><p className={`mt-0.5 text-xs ${index === 1 ? "text-white/55" : "text-[color:var(--muted)]"}`}>{copy}</p></div>
                    <ArrowRight size={15} className={index === 1 ? "text-[color:var(--accent)]" : "text-[color:var(--muted-light)]"} />
                  </div>
                ))}
              </div>
              <p className="text-sm leading-6 text-[color:var(--muted)]">One place, fewer dead ends, and a clear next step at every moment.</p>
            </div>
          </div>
        </div>

        <div className="py-20 md:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
            <div>
              <p className="eyebrow">How we think</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.055em] text-[color:var(--ink)] sm:text-5xl">Clarity is a feature.</h2>
              <p className="mt-5 text-sm leading-7 text-[color:var(--muted)] sm:text-base">The best marketplace experience is not the one with the most on screen. It is the one that makes the next decision obvious.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {principles.map((item) => (
                <article key={item.number} className="flex min-h-72 flex-col rounded-[22px] bg-white p-6 ring-1 ring-black/[0.055] transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow)]">
                  <div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]"><item.icon size={18} /></span><span className="text-xs font-semibold text-[color:var(--muted-light)]">{item.number}</span></div>
                  <h3 className="mt-auto pt-10 text-xl font-semibold leading-7 tracking-[-0.035em] text-[color:var(--ink)]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>

        <section className="grid overflow-hidden rounded-[28px] bg-[color:var(--ink)] text-white lg:grid-cols-[1fr_1fr]" aria-labelledby="trust-title">
          <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Built around trust</p>
            <h2 id="trust-title" className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Confidence should not disappear after “buy now.”</h2>
          </div>
          <div className="grid gap-px bg-white/10 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, title: "Protected details", copy: "Account and checkout information stays in the right context." },
              { icon: Truck, title: "Visible delivery", copy: "Order tracking keeps progress easy to understand." },
              { icon: BadgeCheck, title: "Clear information", copy: "Important product and price details are given room to breathe." },
              { icon: PackageSearch, title: "Support continuity", copy: "Your order reference connects tracking and customer care." }
            ].map((item) => <div key={item.title} className="bg-[color:var(--ink)] p-6 sm:p-8"><item.icon size={19} className="text-[color:var(--accent)]" /><h3 className="mt-5 text-base font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{item.copy}</p></div>)}
          </div>
        </section>

        <div className="mt-8"><CommerceTrustStrip /></div>
      </section>
    </div>
  );
}
