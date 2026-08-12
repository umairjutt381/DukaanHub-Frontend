"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";

import { BrandMark } from "@/components/brands/brand-mark";

export type BrandProfile = {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  productCount: number;
  image?: string | null;
  productName?: string | null;
  productSlug?: string | null;
  segments: string[];
  featured: boolean;
  newCount: number;
};

const filters = ["All", "Popular", "Trending", "Luxury", "Technology", "Fashion", "Beauty", "Sports"];

export function BrandExplorer({ brands }: { brands: BrandProfile[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [letter, setLetter] = useState("All");

  const availableLetters = useMemo(() => [...new Set(brands.map((brand) => brand.name.charAt(0).toUpperCase()).filter((value) => /[A-Z]/.test(value)))].sort(), [brands]);
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return brands.filter((brand) => {
      const matchesQuery = !normalized || brand.name.toLowerCase().includes(normalized);
      const matchesLetter = letter === "All" || brand.name.toUpperCase().startsWith(letter);
      const matchesFilter = filter === "All"
        || (filter === "Popular" && brand.productCount >= 5)
        || (filter === "Trending" && (brand.newCount > 0 || brand.featured))
        || brand.segments.includes(filter);
      return matchesQuery && matchesLetter && matchesFilter && brand.productCount > 0;
    });
  }, [brands, filter, letter, query]);

  function reset() {
    setQuery("");
    setFilter("All");
    setLetter("All");
  }

  return (
    <section id="all-brands" className="scroll-mt-32">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Brand directory</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-neutral-950 sm:text-5xl">Every name, thoughtfully organized.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">Search directly or explore by category, popularity and alphabetical order.</p>
        </div>
        <div className="relative w-full lg:max-w-sm">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <label htmlFor="brand-search" className="sr-only">Search brands</label>
          <input id="brand-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search brands" className="h-[52px] w-full rounded-2xl border border-neutral-200 bg-white py-3.5 pl-11 pr-11 text-sm font-medium outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5" />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear brand search" className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-950"><X size={16} /></button> : null}
        </div>
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by brand group">
        {filters.map((item) => (
          <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${filter === item ? "bg-[color:var(--accent)] text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:border-[color:var(--accent)] hover:text-[color:var(--accent-dark)]"}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-1 overflow-x-auto border-y border-neutral-100 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Filter brands alphabetically">
        {["All", ...availableLetters].map((item) => (
          <button key={item} type="button" onClick={() => setLetter(item)} aria-pressed={letter === item} className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${letter === item ? "bg-[color:var(--accent-wash)] text-[color:var(--accent)]" : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-950"}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-neutral-500" aria-live="polite"><span className="font-semibold text-neutral-950">{filtered.length}</span> {filtered.length === 1 ? "brand" : "brands"}</p>
        {(query || filter !== "All" || letter !== "All") ? <button type="button" onClick={reset} className="text-sm font-semibold text-neutral-600 transition hover:text-neutral-950">Reset filters</button> : null}
      </div>

      {filtered.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((brand) => (
            <Link key={brand.id} href={`/products?brand=${encodeURIComponent(brand.slug)}`} className="group flex min-h-28 items-center gap-4 rounded-2xl border border-neutral-200 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_14px_40px_rgba(0,0,0,0.07)]">
              <BrandMark name={brand.name} logoUrl={brand.logoUrl} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-semibold tracking-[-0.025em] text-neutral-950">{brand.name}</span>
                <span className="mt-1 block text-xs text-neutral-500">{brand.productCount} {brand.productCount === 1 ? "product" : "products"}</span>
                <span className="mt-2 block truncate text-[11px] font-medium text-neutral-400">{brand.segments.slice(0, 2).join(" · ") || "Marketplace brand"}</span>
              </span>
              <ArrowUpRight size={17} className="shrink-0 text-neutral-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-950" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-3xl bg-neutral-50 px-6 text-center">
          <p className="text-lg font-semibold text-neutral-950">No brands match those filters.</p>
          <p className="mt-2 text-sm text-neutral-500">Try another search or reset the directory.</p>
          <button type="button" onClick={reset} className="mt-5 min-h-11 rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Show all brands</button>
        </div>
      )}
    </section>
  );
}
