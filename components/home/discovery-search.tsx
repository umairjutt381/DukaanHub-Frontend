"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useId, useMemo, useState } from "react";
import { ArrowUpRight, Clock3, Search, TrendingUp, X } from "lucide-react";

type SearchItem = {
  name: string;
  slug: string;
  brand?: string;
};

const RECENT_SEARCHES_KEY = "dukaanhub_recent_searches";

export function DiscoverySearch({ items, popularSearches }: { items: SearchItem[]; popularSearches: string[] }) {
  const router = useRouter();
  const listboxId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
      if (Array.isArray(stored)) setRecent(stored.filter((value): value is string => typeof value === "string").slice(0, 4));
    } catch {
      setRecent([]);
    }
  }, []);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items.slice(0, 4);
    return items.filter((item) => `${item.brand || ""} ${item.name}`.toLowerCase().includes(normalized)).slice(0, 5);
  }, [items, query]);

  useEffect(() => setActiveIndex(-1), [query]);

  function rememberSearch(value: string) {
    const normalized = value.trim();
    if (!normalized) return;
    const next = [normalized, ...recent.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 4);
    setRecent(next);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!query.trim()) event.preventDefault();
    else rememberSearch(query);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      const selected = suggestions[activeIndex];
      rememberSearch(query || selected.name);
      setOpen(false);
      router.push(`/product/${selected.slug}`);
    }
  }

  return (
    <div className="relative z-30 mt-8" onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <form action="/search" onSubmit={handleSubmit} className="relative">
        <Search aria-hidden="true" className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" size={21} />
        <label htmlFor="home-product-search" className="sr-only">Search products and brands</label>
        <input
          id="home-product-search"
          name="q"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder="Search the store"
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
          className="h-16 w-full rounded-2xl border border-neutral-200 bg-white pl-14 pr-28 text-[15px] font-medium text-neutral-950 outline-none transition duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5 sm:pr-32"
        />
        {query ? (
          <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-[5.5rem] top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-950 sm:right-24">
            <X size={17} />
          </button>
        ) : null}
        <button type="submit" className="absolute right-2 top-2 h-12 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition duration-200 hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">
          Search
        </button>
      </form>

      {open ? (
        <div className="absolute inset-x-0 top-[4.5rem] overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_24px_70px_rgba(0,0,0,0.14)]">
          {recent.length && !query ? (
            <div className="border-b border-neutral-100 px-3 pb-3 pt-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-2 text-xs font-semibold text-neutral-500"><Clock3 size={14} /> Recent searches</p>
                <button type="button" onClick={() => {
                  setRecent([]);
                  window.localStorage.removeItem(RECENT_SEARCHES_KEY);
                }} className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-950">Clear</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {recent.map((item) => <Link key={item} href={`/search?q=${encodeURIComponent(item)}`} onClick={() => rememberSearch(item)} className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200">{item}</Link>)}
              </div>
            </div>
          ) : null}

          <div className="px-2 py-2">
            <p className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-neutral-500"><TrendingUp size={14} /> {query ? "Suggested products" : "Trending now"}</p>
            <div id={listboxId} role="listbox" aria-label="Product suggestions" className="mt-1">
              {suggestions.length ? suggestions.map((item, index) => (
                <Link id={`${listboxId}-option-${index}`} role="option" aria-selected={activeIndex === index} key={item.slug} href={`/product/${item.slug}`} onMouseEnter={() => setActiveIndex(index)} onClick={() => rememberSearch(query || item.name)} className={`group flex min-h-12 items-center justify-between gap-4 rounded-xl px-3 py-2 transition ${activeIndex === index ? "bg-neutral-100" : "hover:bg-neutral-50"}`}>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-neutral-950">{item.name}</span>
                    {item.brand ? <span className="mt-0.5 block text-xs text-neutral-500">{item.brand}</span> : null}
                  </span>
                  <ArrowUpRight size={16} className="shrink-0 text-neutral-400 transition group-hover:text-neutral-950" />
                </Link>
              )) : <p className="px-3 py-4 text-sm text-neutral-500">No close matches. Press Search to see all results.</p>}
            </div>
          </div>

          {!query ? (
            <div className="flex flex-wrap gap-2 border-t border-neutral-100 px-4 py-3">
              <span className="mr-1 py-1 text-xs font-semibold text-neutral-400">Popular</span>
              {popularSearches.slice(0, 4).map((term) => <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} onClick={() => rememberSearch(term)} className="py-1 text-xs font-semibold text-neutral-700 transition hover:text-[color:var(--accent)]">{term}</Link>)}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
