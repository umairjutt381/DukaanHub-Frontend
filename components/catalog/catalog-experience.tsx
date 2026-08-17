"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Grid2X2,
  LayoutList,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import { ProductCard } from "@/components/home/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Brand, Category, Product } from "@/lib/types";
import {
  CATALOG_INITIAL_RESULTS,
  CATALOG_LOAD_STEP,
  catalogParamList,
  firstCatalogParam,
  type CatalogSearchParams,
} from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";
import { hasFastDispatch, hasFreeShipping } from "@/lib/product-insights";

type SortOption = "recommended" | "newest" | "rating" | "price-low" | "price-high" | "discount";
type CatalogView = "grid" | "list";
type Availability = "all" | "in-stock" | "low-stock";
type Delivery = "all" | "free" | "fast";

type FilterState = {
  q: string;
  category: string;
  brands: string[];
  minPrice: number;
  maxPrice: number;
  rating: number;
  availability: Availability;
  discount: number;
  colors: string[];
  sizes: string[];
  delivery: Delivery;
};

export type CatalogExperienceProps = {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  total: number;
  route: string;
  eyebrow: string;
  title: string;
  description: string;
  initialQuery?: CatalogSearchParams;
  fixedCategory?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  promo?: {
    label: string;
    title: string;
    description: string;
    href: string;
    linkLabel: string;
  };
};

const colorCandidates = ["Black", "White", "Blue", "Green", "Red", "Pink", "Brown", "Gold", "Silver", "Gray"];
const sizeCandidates = ["Small", "Medium", "Large", "XL", "EU 36", "EU 38", "EU 40", "EU 42", "EU 44", "30 ml", "50 ml", "100 ml", "128GB", "256GB", "512GB"];

const defaultPromo = {
  label: "The weekly edit",
  title: "Considered picks, selected for everyday life.",
  description: "Discover customer favourites and thoughtful new additions across the store.",
  href: "/featured-products",
  linkLabel: "Explore the edit",
};

function discountFor(product: Product) {
  if (!product.compare_at_price || product.compare_at_price <= product.price) return 0;
  return Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100);
}

function productText(product: Product) {
  return [product.name, product.description, product.tags, product.specifications, product.brand?.name, product.category?.name]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function presentFacets(products: Product[], candidates: string[]) {
  return candidates.filter((candidate) => products.some((product) => productText(product).includes(candidate.toLowerCase())));
}

function priceBounds(products: Product[]) {
  if (!products.length) return { min: 0, max: 100000 };
  const prices = products.map((product) => product.price);
  const min = Math.max(0, Math.floor(Math.min(...prices) / 500) * 500);
  const max = Math.ceil(Math.max(...prices) / 500) * 500;
  return { min, max: Math.max(min + 500, max) };
}

function initialFilters(query: CatalogSearchParams | undefined, bounds: { min: number; max: number }, fixedCategory?: string): FilterState {
  const numberParam = (key: string, fallback: number) => {
    const raw = firstCatalogParam(query?.[key]);
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const availability = firstCatalogParam(query?.availability);
  const delivery = firstCatalogParam(query?.delivery);

  return {
    q: firstCatalogParam(query?.q),
    category: fixedCategory || firstCatalogParam(query?.category),
    brands: catalogParamList(query?.brand),
    minPrice: Math.max(bounds.min, numberParam("min_price", bounds.min)),
    maxPrice: Math.min(bounds.max, numberParam("max_price", bounds.max)),
    rating: Math.min(5, Math.max(0, numberParam("rating", 0))),
    availability: availability === "in-stock" || availability === "low-stock" ? availability : "all",
    discount: Math.max(0, numberParam("discount", 0)),
    colors: catalogParamList(query?.color),
    sizes: catalogParamList(query?.size),
    delivery: delivery === "free" || delivery === "fast" ? delivery : "all",
  };
}

function initialSort(query?: CatalogSearchParams): SortOption {
  const value = firstCatalogParam(query?.sort);
  return (["newest", "rating", "price-low", "price-high", "discount"] as SortOption[]).includes(value as SortOption)
    ? value as SortOption
    : "recommended";
}

function initialView(query?: CatalogSearchParams): CatalogView {
  return firstCatalogParam(query?.view) === "list" ? "list" : "grid";
}

function countFilters(filters: FilterState, bounds: { min: number; max: number }, fixedCategory?: string) {
  return [
    filters.q,
    !fixedCategory && filters.category,
    ...filters.brands,
    filters.minPrice > bounds.min,
    filters.maxPrice < bounds.max,
    filters.rating > 0,
    filters.availability !== "all",
    filters.discount > 0,
    ...filters.colors,
    ...filters.sizes,
    filters.delivery !== "all",
  ].filter(Boolean).length;
}

function matchesFilters(product: Product, filters: FilterState) {
  const text = productText(product);
  if (filters.q && !text.includes(filters.q.toLowerCase())) return false;
  if (filters.category && product.category?.slug !== filters.category) return false;
  if (filters.brands.length && !filters.brands.includes(product.brand?.slug || "")) return false;
  if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;
  if (filters.rating && product.rating < filters.rating) return false;
  if (filters.availability === "in-stock" && product.stock <= 0) return false;
  if (filters.availability === "low-stock" && (product.stock <= 0 || product.stock > 10)) return false;
  if (filters.discount && discountFor(product) < filters.discount) return false;
  if (filters.colors.length && !filters.colors.some((color) => text.includes(color.toLowerCase()))) return false;
  if (filters.sizes.length && !filters.sizes.some((size) => text.includes(size.toLowerCase()))) return false;
  if (filters.delivery === "free" && !hasFreeShipping(product)) return false;
  if (filters.delivery === "fast" && !hasFastDispatch(product)) return false;
  return true;
}

function sortProducts(products: Product[], sort: SortOption) {
  return [...products].sort((a, b) => {
    if (sort === "newest") return b.id - a.id;
    if (sort === "rating") return b.rating - a.rating || b.review_count - a.review_count;
    if (sort === "price-low") return a.price - b.price;
    if (sort === "price-high") return b.price - a.price;
    if (sort === "discount") return discountFor(b) - discountFor(a);
    const score = (product: Product) => Number(product.is_featured) * 3 + Number(product.is_best_seller) * 2 + product.rating;
    return score(b) - score(a);
  });
}

function CheckOption({ checked, label, count, onChange }: { checked: boolean; label: string; count?: number; onChange: () => void }) {
  return (
    <label className="group flex min-h-10 cursor-pointer items-center justify-between gap-3 py-1 text-sm text-zinc-700">
      <span className="flex items-center gap-3">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
        <span className="grid size-5 place-items-center rounded-md border border-zinc-300 bg-white transition group-hover:border-[color:var(--accent)] peer-focus-visible:ring-2 peer-focus-visible:ring-[color:var(--accent)] peer-focus-visible:ring-offset-2 peer-checked:border-[color:var(--accent)] peer-checked:bg-[color:var(--accent)]">
          <Check className={`size-3.5 text-white transition ${checked ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
        </span>
        {label}
      </span>
      {typeof count === "number" ? <span className="text-xs tabular-nums text-zinc-400">{count}</span> : null}
    </label>
  );
}

function RadioOption({ checked, label, name, onChange }: { checked: boolean; label: string; name: string; onChange: () => void }) {
  return (
    <label className="group flex min-h-10 cursor-pointer items-center gap-3 py-1 text-sm text-zinc-700">
      <input type="radio" name={name} className="peer sr-only" checked={checked} onChange={onChange} />
      <span className="grid size-5 place-items-center rounded-full border border-zinc-300 bg-white transition group-hover:border-zinc-500 peer-focus-visible:ring-2 peer-focus-visible:ring-zinc-900 peer-focus-visible:ring-offset-2 peer-checked:border-zinc-950">
        <span className={`size-2.5 rounded-full bg-[color:var(--accent)] transition ${checked ? "scale-100" : "scale-0"}`} />
      </span>
      {label}
    </label>
  );
}

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-zinc-200 py-5 last:border-0">
      <button type="button" aria-expanded={open} onClick={() => setOpen((current) => !current)} className="flex min-h-8 w-full items-center justify-between text-left text-sm font-semibold text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">
        {title}
        <ChevronDown className={`size-4 text-zinc-400 transition ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open ? <div className="pt-3">{children}</div> : null}
    </section>
  );
}

function FilterPanel({
  filters,
  setFilters,
  products,
  brands,
  colors,
  sizes,
  bounds,
  onApply,
  onReset,
}: {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  products: Product[];
  brands: Brand[];
  colors: string[];
  sizes: string[];
  bounds: { min: number; max: number };
  onApply: () => void;
  onReset: () => void;
}) {
  const toggleList = (key: "brands" | "colors" | "sizes", value: string) => setFilters((current) => ({
    ...current,
    [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value],
  }));

  const brandCounts = useMemo(() => new Map(brands.map((brand) => [brand.slug, products.filter((product) => product.brand?.slug === brand.slug).length])), [brands, products]);
  const availableBrands = brands.filter((brand) => (brandCounts.get(brand.slug) || 0) > 0);
  const supportsFreeDelivery = products.some(hasFreeShipping);
  const supportsFastDispatch = products.some(hasFastDispatch);

  return (
    <div>
      <FilterSection title="Price">
        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-zinc-500">
          <span className="rounded-lg bg-zinc-50 px-3 py-2.5">From <strong className="mt-0.5 block text-sm text-zinc-950">{formatCurrency(filters.minPrice)}</strong></span>
          <span className="rounded-lg bg-zinc-50 px-3 py-2.5">To <strong className="mt-0.5 block text-sm text-zinc-950">{formatCurrency(filters.maxPrice)}</strong></span>
        </div>
        <label className="mt-4 block text-xs font-medium text-zinc-500">
          Minimum price
          <input aria-label="Minimum price" className="mt-2 w-full accent-zinc-950" type="range" min={bounds.min} max={bounds.max} step={500} value={filters.minPrice} onChange={(event) => setFilters((current) => ({ ...current, minPrice: Math.min(Number(event.target.value), current.maxPrice) }))} />
        </label>
        <label className="mt-3 block text-xs font-medium text-zinc-500">
          Maximum price
          <input aria-label="Maximum price" className="mt-2 w-full accent-zinc-950" type="range" min={bounds.min} max={bounds.max} step={500} value={filters.maxPrice} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: Math.max(Number(event.target.value), current.minPrice) }))} />
        </label>
      </FilterSection>

      <FilterSection title="Brand">
        <div className="max-h-56 overflow-y-auto pr-1">
          {availableBrands.slice(0, 18).map((brand) => <CheckOption key={brand.id} label={brand.name} count={brandCounts.get(brand.slug)} checked={filters.brands.includes(brand.slug)} onChange={() => toggleList("brands", brand.slug)} />)}
        </div>
      </FilterSection>

      <FilterSection title="Rating">
        {[4, 3, 2].map((rating) => <RadioOption key={rating} name="catalog-rating" checked={filters.rating === rating} onChange={() => setFilters((current) => ({ ...current, rating }))} label={`${rating}+ stars`} />)}
        <RadioOption name="catalog-rating" checked={filters.rating === 0} onChange={() => setFilters((current) => ({ ...current, rating: 0 }))} label="Any rating" />
      </FilterSection>

      <FilterSection title="Availability">
        <RadioOption name="catalog-availability" checked={filters.availability === "all"} onChange={() => setFilters((current) => ({ ...current, availability: "all" }))} label="All availability" />
        <RadioOption name="catalog-availability" checked={filters.availability === "in-stock"} onChange={() => setFilters((current) => ({ ...current, availability: "in-stock" }))} label="In stock" />
        <RadioOption name="catalog-availability" checked={filters.availability === "low-stock"} onChange={() => setFilters((current) => ({ ...current, availability: "low-stock" }))} label="Only a few left" />
      </FilterSection>

      <FilterSection title="Discount" defaultOpen={false}>
        {[10, 20, 30].map((discount) => <RadioOption key={discount} name="catalog-discount" checked={filters.discount === discount} onChange={() => setFilters((current) => ({ ...current, discount }))} label={`${discount}% or more`} />)}
        <RadioOption name="catalog-discount" checked={filters.discount === 0} onChange={() => setFilters((current) => ({ ...current, discount: 0 }))} label="All products" />
      </FilterSection>

      <FilterSection title="Color" defaultOpen={false}>
        {colors.length ? colors.map((color) => <CheckOption key={color} label={color} checked={filters.colors.includes(color)} onChange={() => toggleList("colors", color)} />) : <p className="text-sm leading-6 text-zinc-500">Color is not specified in this collection.</p>}
      </FilterSection>

      <FilterSection title="Size" defaultOpen={false}>
        {sizes.length ? <div className="flex flex-wrap gap-2">{sizes.map((size) => <button key={size} type="button" aria-pressed={filters.sizes.includes(size)} onClick={() => toggleList("sizes", size)} className={`min-h-10 rounded-lg px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${filters.sizes.includes(size) ? "bg-[color:var(--accent)] text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"}`}>{size}</button>)}</div> : <p className="text-sm leading-6 text-zinc-500">Size options are not specified here.</p>}
      </FilterSection>

      <FilterSection title="Delivery" defaultOpen={false}>
        <RadioOption name="catalog-delivery" checked={filters.delivery === "all"} onChange={() => setFilters((current) => ({ ...current, delivery: "all" }))} label="All delivery options" />
        {supportsFreeDelivery ? <RadioOption name="catalog-delivery" checked={filters.delivery === "free"} onChange={() => setFilters((current) => ({ ...current, delivery: "free" }))} label="Free delivery listed" /> : null}
        {supportsFastDispatch ? <RadioOption name="catalog-delivery" checked={filters.delivery === "fast"} onChange={() => setFilters((current) => ({ ...current, delivery: "fast" }))} label="Dispatches within 1–2 days" /> : null}
      </FilterSection>

      <div className="sticky bottom-0 -mx-1 flex gap-2 border-t border-zinc-200 bg-white/95 px-1 py-4 backdrop-blur">
        <button type="button" onClick={onReset} className="min-h-12 flex-1 rounded-xl border border-zinc-200 px-4 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">Reset</button>
        <button type="button" onClick={onApply} className="min-h-12 flex-[1.35] rounded-xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">Apply filters</button>
      </div>
    </div>
  );
}

function ActiveFilters({ filters, bounds, fixedCategory, brands, onChange }: { filters: FilterState; bounds: { min: number; max: number }; fixedCategory?: string; brands: Brand[]; onChange: (filters: FilterState) => void }) {
  const chips: Array<{ key: string; label: string; clear: () => FilterState }> = [];
  if (filters.q) chips.push({ key: "q", label: `“${filters.q}”`, clear: () => ({ ...filters, q: "" }) });
  if (!fixedCategory && filters.category) chips.push({ key: "category", label: filters.category.replace(/-/g, " "), clear: () => ({ ...filters, category: "" }) });
  filters.brands.forEach((slug) => chips.push({ key: `brand-${slug}`, label: brands.find((brand) => brand.slug === slug)?.name || slug, clear: () => ({ ...filters, brands: filters.brands.filter((item) => item !== slug) }) }));
  if (filters.minPrice > bounds.min || filters.maxPrice < bounds.max) chips.push({ key: "price", label: `${formatCurrency(filters.minPrice)} – ${formatCurrency(filters.maxPrice)}`, clear: () => ({ ...filters, minPrice: bounds.min, maxPrice: bounds.max }) });
  if (filters.rating) chips.push({ key: "rating", label: `${filters.rating}+ stars`, clear: () => ({ ...filters, rating: 0 }) });
  if (filters.availability !== "all") chips.push({ key: "availability", label: filters.availability === "in-stock" ? "In stock" : "Only a few left", clear: () => ({ ...filters, availability: "all" }) });
  if (filters.discount) chips.push({ key: "discount", label: `${filters.discount}%+ off`, clear: () => ({ ...filters, discount: 0 }) });
  filters.colors.forEach((color) => chips.push({ key: `color-${color}`, label: color, clear: () => ({ ...filters, colors: filters.colors.filter((item) => item !== color) }) }));
  filters.sizes.forEach((size) => chips.push({ key: `size-${size}`, label: size, clear: () => ({ ...filters, sizes: filters.sizes.filter((item) => item !== size) }) }));
  if (filters.delivery !== "all") chips.push({ key: "delivery", label: filters.delivery === "free" ? "Free delivery" : "Fast dispatch", clear: () => ({ ...filters, delivery: "all" }) });
  if (!chips.length) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Active filters">
      <span className="mr-1 text-xs font-semibold text-zinc-500">Active</span>
      {chips.map((chip) => <button key={chip.key} type="button" onClick={() => onChange(chip.clear())} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-zinc-100 px-3 text-xs font-semibold capitalize text-zinc-700 transition hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">{chip.label}<X className="size-3.5" aria-hidden="true" /><span className="sr-only">Remove filter</span></button>)}
    </div>
  );
}

export function CatalogExperience({
  products,
  categories,
  brands,
  total,
  route,
  eyebrow,
  title,
  description,
  initialQuery,
  fixedCategory,
  emptyTitle = "No products match your filters",
  emptyDescription = "Try removing a filter or searching with a broader term.",
  promo = defaultPromo,
}: CatalogExperienceProps) {
  const pathname = usePathname();
  const router = useRouter();
  const bounds = useMemo(() => priceBounds(products), [products]);
  const initial = useMemo(() => initialFilters(initialQuery, bounds, fixedCategory), [initialQuery, bounds, fixedCategory]);
  const querySort = useMemo(() => initialSort(initialQuery), [initialQuery]);
  const queryView = useMemo(() => initialView(initialQuery), [initialQuery]);
  const [applied, setApplied] = useState<FilterState>(initial);
  const [draft, setDraft] = useState<FilterState>(initial);
  const [search, setSearch] = useState(initial.q);
  const [sort, setSort] = useState<SortOption>(querySort);
  const [view, setView] = useState<CatalogView>(queryView);
  const [visibleCount, setVisibleCount] = useState(CATALOG_INITIAL_RESULTS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [floatingFiltersVisible, setFloatingFiltersVisible] = useState(false);
  const [recentIds, setRecentIds] = useState<number[]>([]);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const filterSheetRef = useRef<HTMLDivElement>(null);
  const filterReturnFocusRef = useRef<HTMLElement | null>(null);
  const resultsSectionRef = useRef<HTMLElement>(null);

  const colors = useMemo(() => presentFacets(products, colorCandidates), [products]);
  const sizes = useMemo(() => presentFacets(products, sizeCandidates), [products]);

  const openFilters = () => {
    filterReturnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setFiltersOpen(true);
  };

  useEffect(() => {
    setApplied(initial);
    setDraft(initial);
    setSearch(initial.q);
    setSort(querySort);
    setView(queryView);
    setVisibleCount(CATALOG_INITIAL_RESULTS);
  }, [initial, querySort, queryView]);

  const updateUrl = (filters: FilterState, nextSort = sort, nextView = view) => {
    const params = new URLSearchParams();
    Object.entries(initialQuery || {}).forEach(([key, value]) => {
      if (!["q", "category", "brand", "min_price", "max_price", "rating", "availability", "discount", "color", "size", "condition", "delivery", "seller", "sort", "view", "page"].includes(key)) {
        (Array.isArray(value) ? value : value ? [value] : []).forEach((item) => params.append(key, item));
      }
    });
    if (filters.q) params.set("q", filters.q);
    if (!fixedCategory && filters.category) params.set("category", filters.category);
    if (filters.brands.length) params.set("brand", filters.brands.join(","));
    if (filters.minPrice > bounds.min) params.set("min_price", String(filters.minPrice));
    if (filters.maxPrice < bounds.max) params.set("max_price", String(filters.maxPrice));
    if (filters.rating) params.set("rating", String(filters.rating));
    if (filters.availability !== "all") params.set("availability", filters.availability);
    if (filters.discount) params.set("discount", String(filters.discount));
    if (filters.colors.length) params.set("color", filters.colors.join(","));
    if (filters.sizes.length) params.set("size", filters.sizes.join(","));
    if (filters.delivery !== "all") params.set("delivery", filters.delivery);
    if (nextSort !== "recommended") params.set("sort", nextSort);
    if (nextView !== "grid") params.set("view", nextView);
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const applyFilters = (filters = draft) => {
    setApplied(filters);
    setDraft(filters);
    setSearch(filters.q);
    setVisibleCount(CATALOG_INITIAL_RESULTS);
    setFiltersOpen(false);
    updateUrl(filters);
  };

  const resetFilters = () => {
    const reset = initialFilters(undefined, bounds, fixedCategory);
    setDraft(reset);
    applyFilters(reset);
  };

  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem("dukaanhub_recently_viewed") || "[]");
      if (Array.isArray(value)) setRecentIds(value.filter((id): id is number => Number.isInteger(id) && id > 0));
    } catch {
      setRecentIds([]);
    }
  }, []);

  useEffect(() => {
    const resultsSection = resultsSectionRef.current;
    if (!resultsSection) return;
    const observer = new IntersectionObserver(([entry]) => setFloatingFiltersVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -80px 0px",
      threshold: 0,
    });
    observer.observe(resultsSection);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFiltersOpen(false);
      if (event.key !== "Tab" || !filterSheetRef.current) return;
      const focusable = Array.from(filterSheetRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      ));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      filterReturnFocusRef.current?.focus();
    };
  }, [filtersOpen]);

  const filtered = useMemo(() => sortProducts(products.filter((product) => matchesFilters(product, applied)), sort), [products, applied, sort]);
  const visible = filtered.slice(0, visibleCount);
  const activeCount = countFilters(applied, bounds, fixedCategory);
  const recentProducts = recentIds.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product)).slice(0, 4);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    applyFilters({ ...draft, q: search.trim() });
  };

  const setCategory = (category: string) => {
    const next = { ...applied, category };
    setApplied(next);
    setDraft(next);
    setVisibleCount(CATALOG_INITIAL_RESULTS);
    updateUrl(next);
  };

  return (
    <div className="bg-[#eef1f2] pb-24 text-zinc-950">
      <section className="container-page pb-5 pt-5">
        <nav className="flex items-center gap-2 text-xs font-medium text-zinc-500" aria-label="Breadcrumb">
          <Link href="/" className="rounded-sm transition hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/products" className="rounded-sm transition hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900">Shop</Link>
          {route !== "/products" ? <><span aria-hidden="true">/</span><span className="max-w-[14rem] truncate text-zinc-950" aria-current="page">{title}</span></> : null}
        </nav>

        <div className="relative mt-5 min-h-[150px] overflow-hidden bg-[#3b4248] text-white shadow-sm" style={{ backgroundImage: "linear-gradient(rgba(36,42,48,.70),rgba(36,42,48,.70)),url('/template/img/apple-cover.jpg')", backgroundPosition: "center", backgroundSize: "cover" }}>
          <div className="flex min-h-[150px] items-center justify-center px-8 py-8 text-center">
            <div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[#39d0d0]">{eyebrow}</p><h1 className="mt-2 text-3xl font-light sm:text-4xl">{title}</h1><p className="mx-auto mt-2 max-w-xl text-sm text-white/65">{description}</p></div>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200 bg-zinc-50/70 py-4" aria-label="Categories">
        <div className="container-page flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {!fixedCategory ? <button type="button" onClick={() => setCategory("")} aria-pressed={!applied.category} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${!applied.category ? "bg-[color:var(--accent)] text-white" : "bg-white text-zinc-600 hover:text-[color:var(--accent-dark)]"}`}>All products</button> : <Link href="/products" className="inline-flex min-h-10 shrink-0 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-600 transition hover:text-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]">All products</Link>}
          {categories.map((category) => fixedCategory ? (
            <Link key={category.id} href={`/category/${category.slug}`} aria-current={category.slug === fixedCategory ? "page" : undefined} className={`inline-flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${category.slug === fixedCategory ? "bg-[color:var(--accent)] text-white" : "bg-white text-zinc-600 hover:text-[color:var(--accent-dark)]"}`}>{category.name}</Link>
          ) : (
            <button key={category.id} type="button" onClick={() => setCategory(category.slug)} aria-pressed={applied.category === category.slug} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${applied.category === category.slug ? "bg-[color:var(--accent)] text-white" : "bg-white text-zinc-600 hover:text-[color:var(--accent-dark)]"}`}>{category.name}</button>
          ))}
        </div>
      </section>

      <section ref={resultsSectionRef} className="container-page py-10 md:py-14" aria-labelledby="catalog-results-heading">
        <div className="grid gap-10 lg:grid-cols-[272px_minmax(0,1fr)] xl:gap-14">
          <aside className="hidden lg:block" aria-label="Product filters">
            <div className="sticky top-[var(--sticky-shell-offset)] max-h-[calc(100vh_-_var(--sticky-shell-offset)_-_1rem)] overflow-y-auto pr-3 transition-[top,max-height] duration-300 [scrollbar-width:thin]">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4"><h2 className="text-base font-semibold">Filters</h2>{activeCount ? <button type="button" onClick={resetFilters} className="text-xs font-semibold text-zinc-500 underline-offset-4 hover:text-zinc-950 hover:underline">Clear {activeCount}</button> : null}</div>
              <FilterPanel filters={draft} setFilters={setDraft} products={products} brands={brands} colors={colors} sizes={sizes} bounds={bounds} onApply={() => applyFilters()} onReset={resetFilters} />
            </div>
          </aside>

          <div className="min-w-0">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-[0_8px_32px_rgba(0,0,0,0.04)] sm:p-4">
              <form onSubmit={submitSearch} role="search" className="flex items-center gap-2">
                <Search className="ml-2 size-5 shrink-0 text-zinc-400" aria-hidden="true" />
                <label htmlFor="catalog-search" className="sr-only">Search within these products</label>
                <input id="catalog-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search within this collection" className="min-h-12 min-w-0 flex-1 bg-transparent px-1 text-base text-zinc-950 outline-none placeholder:text-zinc-400" />
                {search ? <button type="button" onClick={() => { setSearch(""); applyFilters({ ...draft, q: "" }); }} className="grid size-10 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900" aria-label="Clear product search"><X className="size-4" /></button> : null}
                <button type="submit" className="min-h-11 shrink-0 rounded-xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">Search</button>
              </form>
            </div>

            <div className="my-6 overflow-hidden border-l-4 border-[#00acac] bg-[#3b4248] text-white">
              <div className="grid min-h-44 gap-6 p-6 sm:grid-cols-[1fr_auto] sm:items-center md:p-8">
                <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#39d0d0]">{promo.label}</p><h2 className="mt-2 text-2xl font-light md:text-3xl">{promo.title}</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/65">{promo.description}</p></div>
                <Link href={promo.href} className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">{promo.linkLabel}<ArrowRight className="size-4" aria-hidden="true" /></Link>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5">
              <div><h2 id="catalog-results-heading" className="text-lg font-semibold">Explore products</h2><p className="mt-1 text-sm text-zinc-500" aria-live="polite"><span className="font-semibold tabular-nums text-zinc-950">{filtered.length}</span> of {total} results</p></div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={openFilters} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 transition hover:border-[color:var(--accent)] lg:hidden"><SlidersHorizontal className="size-4" aria-hidden="true" />Filters{activeCount ? <span className="grid size-5 place-items-center rounded-full bg-[color:var(--accent)] text-[10px] text-white">{activeCount}</span> : null}</button>
                <label htmlFor="catalog-sort" className="sr-only">Sort products</label>
                <select id="catalog-sort" value={sort} onChange={(event) => { const next = event.target.value as SortOption; setSort(next); setVisibleCount(CATALOG_INITIAL_RESULTS); updateUrl(applied, next, view); }} className="min-h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none transition hover:border-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-900/10">
                  <option value="recommended">Recommended</option><option value="newest">Newest</option><option value="rating">Highest rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="discount">Biggest saving</option>
                </select>
                <div className="hidden rounded-xl border border-zinc-200 p-1 sm:flex" aria-label="Product layout">
                  <button type="button" aria-label="Grid view" aria-pressed={view === "grid"} onClick={() => { setView("grid"); updateUrl(applied, sort, "grid"); }} className={`grid size-9 place-items-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${view === "grid" ? "bg-[color:var(--accent)] text-white" : "text-zinc-500 hover:bg-zinc-100"}`}><Grid2X2 className="size-4" /></button>
                  <button type="button" aria-label="List view" aria-pressed={view === "list"} onClick={() => { setView("list"); updateUrl(applied, sort, "list"); }} className={`grid size-9 place-items-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] ${view === "list" ? "bg-[color:var(--accent)] text-white" : "text-zinc-500 hover:bg-zinc-100"}`}><LayoutList className="size-4" /></button>
                </div>
              </div>
            </div>

            <ActiveFilters filters={applied} bounds={bounds} fixedCategory={fixedCategory} brands={brands} onChange={applyFilters} />

            {visible.length ? (
              <div className={view === "grid" ? "grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:gap-x-6" : "space-y-4"}>
                {visible.map((product) => <ProductCard key={product.id} product={product} view={view} />)}
              </div>
            ) : <EmptyState title={emptyTitle} description={emptyDescription} action={<button type="button" onClick={resetFilters} className="inline-flex min-h-11 items-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Reset all filters</button>} />}

            {filtered.length > visible.length ? (
              <div className="mt-12 text-center">
                <p className="text-sm font-medium text-zinc-600">Showing {visible.length} of {filtered.length}</p>
                <div className="mx-auto mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-zinc-100" role="progressbar" aria-label="Products loaded" aria-valuemin={0} aria-valuemax={filtered.length} aria-valuenow={visible.length}><div className="h-full rounded-full bg-emerald-600 transition-[width] duration-500" style={{ width: `${Math.min(100, (visible.length / filtered.length) * 100)}%` }} /></div>
                <button type="button" onClick={() => setVisibleCount((count) => count + CATALOG_LOAD_STEP)} className="mt-5 min-h-12 rounded-xl border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:border-zinc-950 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2">Load {Math.min(CATALOG_LOAD_STEP, filtered.length - visible.length)} more</button>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {recentProducts.length ? (
        <section className="container-page border-t border-zinc-200 pt-14" aria-labelledby="recently-viewed-heading">
          <div className="mb-6 flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">Pick up where you left off</p><h2 id="recently-viewed-heading" className="mt-1 text-2xl font-semibold tracking-[-0.035em]">Recently viewed</h2></div><Sparkles className="size-5 text-emerald-600" aria-hidden="true" /></div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4">{recentProducts.map((product) => <ProductCard key={product.id} product={product} view="grid" />)}</div>
        </section>
      ) : null}

      <button type="button" onClick={openFilters} tabIndex={floatingFiltersVisible && !filtersOpen ? 0 : -1} aria-hidden={!floatingFiltersVisible || filtersOpen} className={`fixed bottom-24 left-1/2 z-30 inline-flex min-h-12 -translate-x-1/2 items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(33,40,68,0.28)] transition duration-200 hover:bg-[color:var(--accent-dark)] lg:hidden ${floatingFiltersVisible && !filtersOpen ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`} aria-haspopup="dialog" aria-expanded={filtersOpen}><SlidersHorizontal className="size-4" aria-hidden="true" />Filters{activeCount ? <span className="grid size-5 place-items-center rounded-full bg-white text-[10px] text-[color:var(--accent-dark)]">{activeCount}</span> : null}</button>

      {filtersOpen ? (
        <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-filters-title">
          <button type="button" className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" onClick={() => setFiltersOpen(false)} aria-label="Close filters" />
          <div ref={filterSheetRef} className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl">
            <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between border-b border-zinc-200 bg-white/95 px-5 py-4 backdrop-blur"><div><div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300" /><h2 id="mobile-filters-title" className="text-lg font-semibold">Refine products</h2></div><button ref={closeButtonRef} type="button" onClick={() => setFiltersOpen(false)} className="grid size-11 place-items-center rounded-full bg-zinc-100 text-zinc-600" aria-label="Close filters"><X className="size-5" /></button></div>
            <FilterPanel filters={draft} setFilters={setDraft} products={products} brands={brands} colors={colors} sizes={sizes} bounds={bounds} onApply={() => applyFilters()} onReset={resetFilters} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
