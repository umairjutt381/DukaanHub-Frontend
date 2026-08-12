"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Clock3, LoaderCircle, Search, TrendingUp, X } from "lucide-react";

import { api } from "@/lib/api/client";
import type { ApiList, Category, Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { AssetImage } from "@/components/ui/asset-image";

const RECENT_SEARCHES_KEY = "dukaanhub_recent_searches";
const fallbackSearches = ["Wireless earbuds", "Running shoes", "Skincare", "Smart watches", "Home essentials"];

function readRecentSearches() {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

function primaryImage(product: Product) {
  return product.images.find((image) => image.is_primary)?.url || product.images[0]?.url;
}

export function HeaderSearch({ mobile = false, onOpenChange }: { mobile?: boolean; onOpenChange?: (open: boolean) => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discoveryLoaded, setDiscoveryLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  useEffect(() => () => onOpenChange?.(false), [onOpenChange]);

  const normalizedQuery = query.trim();
  const popularSearches = useMemo(() => {
    const names = categories.slice(0, 5).map((category) => category.name);
    return names.length ? names : fallbackSearches;
  }, [categories]);

  const loadDiscovery = useCallback(async () => {
    setRecent(readRecentSearches());
    if (discoveryLoaded) return;
    setDiscoveryLoaded(true);
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        api.get<ApiList<Product>>("/catalog/products?best_seller=true&page_size=4"),
        api.get<Category[]>("/catalog/categories")
      ]);
      setTrending(productsResponse.data.items || []);
      setCategories(categoriesResponse.data || []);
    } catch {
      setTrending([]);
      setCategories([]);
    }
  }, [discoveryLoaded]);

  useEffect(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, [pathname]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    if (!mobile) return;
    const focusSearch = () => {
      window.dispatchEvent(new Event("dukaanhub:show-header"));
      setOpen(true);
      void loadDiscovery();
      window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    };
    window.addEventListener("dukaanhub:focus-search", focusSearch);
    return () => window.removeEventListener("dukaanhub:focus-search", focusSearch);
  }, [loadDiscovery, mobile]);

  useEffect(() => {
    if (mobile) return;
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        window.dispatchEvent(new Event("dukaanhub:show-header"));
        setOpen(true);
        void loadDiscovery();
        window.requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, [loadDiscovery, mobile]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get<ApiList<Product>>("/catalog/products", {
          params: { q: normalizedQuery, page_size: 6 },
          signal: controller.signal
        });
        setSuggestions(response.data.items || []);
        setActiveIndex(-1);
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 220);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [normalizedQuery]);

  const rememberSearch = (value: string) => {
    const cleanValue = value.trim();
    if (!cleanValue) return;
    const next = [cleanValue, ...readRecentSearches().filter((item) => item.toLowerCase() !== cleanValue.toLowerCase())].slice(0, 5);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    setRecent(next);
  };

  const submitSearch = (value = normalizedQuery) => {
    const cleanValue = value.trim();
    if (!cleanValue) {
      router.push("/products");
    } else {
      rememberSearch(cleanValue);
      router.push(`/search?q=${encodeURIComponent(cleanValue)}`);
    }
    setOpen(false);
  };

  const goToProduct = (product: Product) => {
    rememberSearch(normalizedQuery || product.name);
    router.push(`/product/${product.slug}`);
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) goToProduct(suggestions[activeIndex]);
      else submitSearch();
    }
  };

  const clearRecent = () => {
    window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecent([]);
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch();
        }}
      >
        <label className="group relative block">
          <span className="sr-only">Search products, categories, and brands</span>
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-neutral-500 transition-colors group-focus-within:text-neutral-950"
            size={mobile ? 18 : 20}
          />
          <input
            ref={inputRef}
            value={query}
            onFocus={() => {
              setOpen(true);
              void loadDiscovery();
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={mobile ? "Search products and brands" : "Search essentials, groceries and more..."}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={normalizedQuery.length >= 2 ? `${listboxId}-results` : listboxId}
            aria-autocomplete="list"
            aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
            className={`w-full rounded-full border border-[#e7e9f0] bg-[#f7f8fb] pl-12 pr-12 font-medium text-neutral-950 outline-none transition-all duration-200 placeholder:font-normal placeholder:text-[#9a9fb0] hover:bg-white focus:border-[#212844] focus:bg-white focus:ring-2 focus:ring-[#212844]/10 ${mobile ? "h-11 text-sm" : "h-11 text-sm"}`}
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-200 hover:text-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950"
            >
              <X size={16} />
            </button>
          ) : (
            <span className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-neutral-200 bg-white px-2 py-1 text-[0.65rem] font-semibold text-neutral-400 xl:block">⌘ K</span>
          )}
        </label>
      </form>

      {open ? (
        <div
          id={listboxId}
          role="dialog"
          aria-label="Search products"
          className={`${mobile ? "absolute left-0 right-0 top-[calc(100%+12px)] max-h-[min(68vh,620px)]" : "absolute left-0 right-0 top-[calc(100%+12px)] max-h-[min(72vh,640px)]"} z-[70] overflow-y-auto rounded-3xl border border-neutral-200/80 bg-white p-2 shadow-[0_24px_80px_rgba(0,0,0,0.16)]`}
        >
          {normalizedQuery.length >= 2 ? (
            <div>
              <div className="flex items-center justify-between px-4 pb-2 pt-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Suggestions</p>
                {loading ? <LoaderCircle className="animate-spin text-neutral-400" size={16} aria-label="Loading suggestions" /> : null}
              </div>

              {!loading && suggestions.length === 0 ? (
                <button type="button" onClick={() => submitSearch()} className="group flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left transition hover:bg-neutral-50">
                  <span>
                    <span className="block text-sm font-semibold text-neutral-950">Search for “{normalizedQuery}”</span>
                    <span className="mt-1 block text-xs text-neutral-500">See every matching product</span>
                  </span>
                  <ArrowRight size={18} className="text-neutral-400 transition group-hover:translate-x-0.5 group-hover:text-neutral-950" />
                </button>
              ) : null}

              <div id={`${listboxId}-results`} role="listbox" aria-label="Product suggestions" className="space-y-1">
                {suggestions.map((product, index) => (
                  <button
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={activeIndex === index}
                    key={product.id}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goToProduct(product)}
                    className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition ${activeIndex === index ? "bg-neutral-100" : "hover:bg-neutral-50"}`}
                  >
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      <AssetImage src={primaryImage(product)} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.68rem] font-bold uppercase tracking-[0.1em] text-neutral-400">{product.brand?.name || product.category?.name || "DukaanHub"}</span>
                      <span className="mt-1 block truncate text-sm font-semibold text-neutral-900">{product.name}</span>
                      <span className="mt-1 block text-sm font-bold text-neutral-950">{formatCurrency(product.price)}</span>
                    </span>
                    <ArrowRight size={17} className="mr-2 shrink-0 text-neutral-300" />
                  </button>
                ))}
              </div>

              {suggestions.length ? (
                <button type="button" onClick={() => submitSearch()} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--accent)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:ring-offset-2">
                  View all results for “{normalizedQuery}” <ArrowRight size={16} />
                </button>
              ) : null}
            </div>
          ) : (
            <div className="p-2 sm:p-3">
              {recent.length ? (
                <section aria-labelledby={`${listboxId}-recent`}>
                  <div className="flex items-center justify-between">
                    <h2 id={`${listboxId}-recent`} className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500"><Clock3 size={14} /> Recent searches</h2>
                    <button type="button" onClick={clearRecent} className="rounded-lg px-2 py-1 text-xs font-semibold text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-950">Clear</button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recent.map((item) => <button key={item} type="button" onClick={() => submitSearch(item)} className="rounded-full bg-neutral-100 px-3.5 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-[color:var(--accent)] hover:text-white">{item}</button>)}
                  </div>
                </section>
              ) : null}

              <section className={recent.length ? "mt-6" : ""} aria-labelledby={`${listboxId}-popular`}>
                <h2 id={`${listboxId}-popular`} className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-500"><TrendingUp size={14} /> Popular right now</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {popularSearches.map((item) => <button key={item} type="button" onClick={() => submitSearch(item)} className="rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950">{item}</button>)}
                </div>
              </section>

              {trending.length ? (
                <section className="mt-6 border-t border-neutral-100 pt-5" aria-labelledby={`${listboxId}-trending`}>
                  <div className="flex items-center justify-between">
                    <h2 id={`${listboxId}-trending`} className="text-xs font-bold uppercase tracking-[0.14em] text-neutral-500">Trending products</h2>
                    <Link href="/best-sellers" onClick={() => setOpen(false)} className="text-xs font-semibold text-neutral-950 hover:underline">Shop all</Link>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {trending.slice(0, 4).map((product) => (
                      <Link key={product.id} href={`/product/${product.slug}`} onClick={() => setOpen(false)} className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-neutral-50">
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-neutral-100"><AssetImage src={primaryImage(product)} alt="" fill sizes="56px" className="object-cover transition duration-300 group-hover:scale-105" /></span>
                        <span className="min-w-0"><span className="block truncate text-xs font-semibold text-neutral-900">{product.name}</span><span className="mt-1 block text-xs font-bold text-neutral-950">{formatCurrency(product.price)}</span></span>
                      </Link>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
