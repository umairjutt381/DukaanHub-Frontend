"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, CircleDollarSign, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";

import { api } from "@/lib/api/client";
import type { Brand, Category } from "@/lib/types";

const fallbackCategories = [
  { id: 1, name: "Electronics", slug: "electronics", is_featured: true },
  { id: 2, name: "Fashion", slug: "fashion", is_featured: true },
  { id: 3, name: "Beauty & Personal Care", slug: "beauty-personal-care", is_featured: true },
  { id: 4, name: "Home & Living", slug: "home-living", is_featured: true },
  { id: 5, name: "Sports & Outdoors", slug: "sports-outdoors", is_featured: true },
  { id: 6, name: "Groceries", slug: "groceries", is_featured: true }
] satisfies Category[];

export function CategoryMegaMenu({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [onOpenChange, open]);

  useEffect(() => () => onOpenChange?.(false), [onOpenChange]);

  const loadMenu = async () => {
    if (loaded) return;
    setLoaded(true);
    try {
      const [categoryResponse, brandResponse] = await Promise.all([
        api.get<Category[]>("/catalog/categories"),
        api.get<Brand[]>("/catalog/brands")
      ]);
      if (categoryResponse.data.length) setCategories(categoryResponse.data);
      setBrands(brandResponse.data || []);
    } catch {
      // The curated fallback keeps navigation useful while the API reconnects.
    }
  };

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const featuredBrands = brands.filter((brand) => brand.is_featured).slice(0, 6);
  const displayedBrands = featuredBrands.length ? featuredBrands : brands.slice(0, 6);
  const isActive = pathname === "/categories" || pathname.startsWith("/category/");

  return (
    <div
      ref={rootRef}
      className="relative flex h-full items-center"
      onMouseEnter={() => {
        setOpen(true);
        void loadMenu();
      }}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => {
        setOpen(true);
        void loadMenu();
      }}
      onBlur={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => {
          setOpen((current) => !current);
          void loadMenu();
        }}
        aria-expanded={open}
        aria-controls="category-mega-menu"
        className={`group flex h-12 items-center gap-2 rounded-xl px-3 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${isActive || open ? "bg-[color:var(--accent)] text-white" : "text-neutral-800 hover:bg-neutral-100"}`}
      >
        Shop
        <ChevronDown size={15} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div id="category-mega-menu" className="absolute left-0 top-[calc(100%+1px)] z-[60] w-[min(1040px,calc(100vw-64px))] pt-3">
          <div className="overflow-hidden rounded-3xl border border-neutral-200/80 bg-white shadow-[0_28px_90px_rgba(0,0,0,0.15)]">
            <div className="grid grid-cols-[1.5fr_0.8fr_0.8fr]">
              <section className="p-7" aria-labelledby="shop-by-category-title">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-700">Explore the store</p>
                    <h2 id="shop-by-category-title" className="mt-1 text-xl font-bold tracking-[-0.03em] text-neutral-950">Shop by category</h2>
                  </div>
                  <Link href="/categories" className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 transition hover:text-neutral-950">View all <ArrowRight size={14} /></Link>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1">
                  {categories.slice(0, 12).map((category, index) => (
                    <Link key={category.id} href={`/category/${category.slug}`} className="group flex min-h-12 items-center justify-between border-b border-neutral-100 py-3 text-sm font-semibold text-neutral-700 transition hover:text-neutral-950">
                      <span className="flex min-w-0 items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[0.65rem] font-bold text-neutral-500 transition group-hover:bg-[color:var(--accent)] group-hover:text-white">{String(index + 1).padStart(2, "0")}</span>
                        <span className="truncate">{category.name}</span>
                      </span>
                      <ArrowRight size={14} className="shrink-0 -translate-x-1 text-neutral-300 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </section>

              <section className="border-l border-neutral-100 bg-neutral-50/70 p-7" aria-labelledby="discover-title">
                <h2 id="discover-title" className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">Discover</h2>
                <nav className="mt-4 space-y-1" aria-label="Featured collections">
                  {[
                    ["Just arrived", "/new-arrivals", Sparkles],
                    ["Best sellers", "/best-sellers", PackageCheck],
                    ["Today’s offers", "/deals", CircleDollarSign],
                    ["Featured picks", "/featured-products", ShieldCheck]
                  ].map(([label, href, Icon]) => (
                    <Link key={href as string} href={href as string} className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-white hover:text-neutral-950 hover:shadow-sm">
                      <Icon size={17} className="text-neutral-400 transition group-hover:text-emerald-700" />
                      {label as string}
                    </Link>
                  ))}
                </nav>
                {displayedBrands.length ? (
                  <div className="mt-6 border-t border-neutral-200 pt-5">
                    <div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-[0.15em] text-neutral-500">Popular brands</h3><Link href="/brands" className="text-[0.68rem] font-semibold text-neutral-500 hover:text-neutral-950">All brands</Link></div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {displayedBrands.map((brand) => <Link key={brand.id} href={`/products?brand=${brand.slug}`} className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200 transition hover:ring-neutral-950">{brand.name}</Link>)}
                    </div>
                  </div>
                ) : null}
              </section>

              <aside className="relative isolate flex min-h-[420px] flex-col justify-between overflow-hidden bg-neutral-950 p-7 text-white">
                <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
                <div>
                  <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-emerald-300">DukaanHub edit</span>
                  <h2 className="mt-6 text-3xl font-bold leading-[1.05] tracking-[-0.045em]">The things worth finding.</h2>
                  <p className="mt-4 text-sm leading-6 text-white/60">A considered selection of standout products, useful upgrades, and everyday essentials.</p>
                </div>
                <div>
                  <div className="mb-5 grid grid-cols-2 gap-2 text-[0.68rem] font-semibold text-white/60">
                    <span className="rounded-xl border border-white/10 p-3">Verified catalog</span>
                    <span className="rounded-xl border border-white/10 p-3">Nationwide delivery</span>
                  </div>
                  <Link href="/products" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white text-sm font-bold text-neutral-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-950">Explore everything <ArrowRight size={16} /></Link>
                </div>
              </aside>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
