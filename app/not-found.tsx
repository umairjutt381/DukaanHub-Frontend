import Link from "next/link";
import { ArrowRight, Home, SearchX, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <section className="container-page py-10 md:py-16">
      <div className="mx-auto grid min-h-[34rem] max-w-5xl overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex items-center justify-center overflow-hidden bg-[color:var(--ink)] p-10 text-white">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -right-24 h-72 w-72 rounded-full bg-[color:var(--accent)]/20" />
          <div className="relative text-center">
            <SearchX size={52} className="mx-auto text-[color:var(--accent)]" />
            <p className="mt-6 text-8xl font-black tracking-[-0.08em] sm:text-9xl">404</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45">Page not found</p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <p className="eyebrow">Wrong turn</p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.045em] text-[color:var(--ink)] sm:text-5xl">This page is not available.</h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-[color:var(--muted)]">The address may be incorrect, or the page may have moved. Use one of the routes below to continue shopping.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[color:var(--accent)] px-5 py-3 text-sm font-bold text-white transition hover:bg-[color:var(--accent-dark)] sm:w-auto"><Home size={16} className="mr-2" /> Go to homepage</Link>
            <Link href="/products" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[color:var(--line-dark)] bg-white px-5 text-sm font-bold text-[color:var(--ink)] transition hover:border-[color:var(--ink)]"><ShoppingBag size={16} className="mr-2" /> Browse products</Link>
          </div>
          <Link href="/contact" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--accent-dark)]">Still need help? Contact customer care <ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}
