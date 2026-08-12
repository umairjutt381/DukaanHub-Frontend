import Link from "next/link";
import { ArrowRight, BadgeCheck, LockKeyhole, Sparkles, Truck } from "lucide-react";

import { AssetImage } from "@/components/ui/asset-image";
import { DiscoverySearch } from "@/components/home/discovery-search";
import { formatCurrency, resolveAssetUrl } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";

function productImage(product?: Product | null) {
  return resolveAssetUrl(product?.images?.find((item) => item.is_primary)?.url || product?.images?.[0]?.url);
}

export function Hero({ categories, products }: { categories: Category[]; products: Product[] }) {
  const primary = products[0] ?? null;
  const secondary = products[1] ?? products[0] ?? null;
  const popularSearches = [
    ...new Set([
      primary?.brand?.name,
      "Smartphones",
      "Running shoes",
      "Home essentials",
      categories[0]?.name,
    ].filter((value): value is string => Boolean(value))),
  ];

  return (
    <section className="container-page pt-3 sm:pt-5 lg:pt-6">
      <div className="relative grid overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br from-[#121b3b] to-[#1b2757] shadow-[var(--shadow-md)] lg:min-h-[280px] lg:grid-cols-[0.95fr_1.05fr]">
        <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full border-[18px] border-[#0ba8da]/15" />
        <div className="relative z-20 flex flex-col justify-center px-5 py-8 text-white sm:px-9 sm:py-10 lg:px-12">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-medium text-[#b9c4e6]">
              <Sparkles size={14} /> Big finds. Better prices.
            </p>
            <h1 className="mt-2 max-w-xl text-[clamp(2rem,4vw,2.65rem)] font-extrabold leading-[1.1] tracking-[-0.035em] text-white">
              SMART WEARABLE.
            </h1>
            <p className="mt-2 text-xl font-bold text-[#8fc2ff]">
              Up to 80% OFF
            </p>

            <DiscoverySearch
              items={products.slice(0, 12).map((product) => ({ name: product.name, slug: product.slug, brand: product.brand?.name }))}
              popularSearches={popularSearches}
            />

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.68rem] font-medium text-white/70">
              <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#8fc2ff]" /> Verified products</span>
              <span className="inline-flex items-center gap-1.5"><LockKeyhole size={14} className="text-[#8fc2ff]" /> Secure checkout</span>
              <span className="inline-flex items-center gap-1.5"><Truck size={14} className="text-[#8fc2ff]" /> Nationwide delivery</span>
            </div>
          </div>
        </div>

        <div className="relative min-h-[260px] overflow-hidden bg-[linear-gradient(135deg,#d9f5fb_0%,#a8e6f3_48%,#72d4eb_100%)] lg:min-h-0">
          <div className="absolute -right-16 -top-24 h-80 w-80 rounded-full border-[22px] border-white/30" />
          <div className="absolute -bottom-28 right-32 h-64 w-64 rounded-full bg-white/20" />

          {primary ? (
            <Link href={`/product/${primary.slug}`} aria-label={`View ${primary.name}`} className="group absolute inset-x-8 bottom-20 top-4 sm:inset-x-20 sm:bottom-16 sm:top-5">
              <AssetImage
                src={productImage(primary)}
                alt={primary.name}
                fill
                priority
                sizes="(min-width: 1024px) 52vw, 100vw"
                className="object-contain p-3 drop-shadow-[0_22px_22px_rgba(0,55,75,0.2)] transition duration-700 ease-out group-hover:scale-[1.025] group-hover:-rotate-1"
              />
            </Link>
          ) : null}

          {secondary && secondary.id !== primary?.id ? (
            <Link href={`/product/${secondary.slug}`} aria-label={`View ${secondary.name}`} className="group absolute right-5 top-5 hidden h-36 w-32 overflow-hidden rounded-2xl border border-white/90 bg-white/75 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur sm:block lg:right-6 lg:top-6">
              <AssetImage src={productImage(secondary)} alt="" fill sizes="128px" className="object-contain p-4 transition duration-500 group-hover:scale-105" />
            </Link>
          ) : null}

          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 rounded-[8px] border border-white/80 bg-white/90 p-3 shadow-[0_12px_30px_rgba(0,55,75,0.12)] backdrop-blur-xl sm:inset-x-5 sm:p-3.5">
            <div className="min-w-0">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[color:var(--accent-dark)]">Featured pick</p>
              <h2 className="mt-1 truncate text-sm font-bold tracking-[-0.02em] text-neutral-950 sm:text-base">{primary?.name || "The considered collection"}</h2>
              {primary ? <p className="mt-0.5 text-xs font-semibold text-neutral-700">{formatCurrency(primary.price)}</p> : <p className="mt-0.5 text-xs text-neutral-500">Discover something made for you.</p>}
            </div>
            <Link href={primary ? `/product/${primary.slug}` : "/products"} aria-label="Explore the editor's pick" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-white transition duration-200 hover:scale-105 hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Popular departments">
        <Link href="/products" className="shrink-0 rounded-md bg-[color:var(--accent)] px-3.5 py-1.5 text-xs font-bold text-white">Shop all</Link>
        {categories.slice(0, 7).map((category) => (
          <Link key={category.id} href={`/category/${category.slug}`} className="shrink-0 rounded-md border border-neutral-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-dark)]">
            {category.name}
          </Link>
        ))}
      </div>
    </section>
  );
}
