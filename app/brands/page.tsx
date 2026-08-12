import Link from "next/link";
import { ArrowRight, ArrowUpRight, Flame, Sparkles } from "lucide-react";

import { BrandExplorer, type BrandProfile } from "@/components/brands/brand-explorer";
import { BrandMark } from "@/components/brands/brand-mark";
import { AssetImage } from "@/components/ui/asset-image";
import { SectionHeading } from "@/components/home/section-heading";
import { serverApi } from "@/lib/api/server";
import type { Brand, Product } from "@/lib/types";
import { resolveAssetUrl } from "@/lib/utils";

const luxuryPattern = /annibale|calvin klein|chanel|dior|dolce|gucci|iwc|longines|off white|prada|rolex/i;
const technologyPattern = /amazon|apple|asus|beats|dell|gadget|gigabyte|huawei|lenovo|oppo|provision|realme|samsung|snaptech|techgear|vivo/i;
const sportsPattern = /nike|puma|motogp|kawasaki|speedmaster/i;

function imageFor(product?: Product | null) {
  return resolveAssetUrl(product?.images?.find((item) => item.is_primary)?.url || product?.images?.[0]?.url);
}

function buildProfiles(brands: Brand[], products: Product[]): BrandProfile[] {
  return brands.map((brand) => {
    const matching = products.filter((product) => product.brand?.id === brand.id || product.brand?.slug === brand.slug);
    const categories = new Set(matching.map((product) => product.category?.slug).filter((value): value is string => Boolean(value)));
    const segments = new Set<string>();
    if (luxuryPattern.test(brand.name)) segments.add("Luxury");
    if (technologyPattern.test(brand.name) || categories.has("electronics")) segments.add("Technology");
    if (categories.has("fashion")) segments.add("Fashion");
    if (categories.has("beauty-personal-care")) segments.add("Beauty");
    if (sportsPattern.test(brand.name) || categories.has("sports-outdoors")) segments.add("Sports");
    if (categories.has("home-living")) segments.add("Home");
    if (categories.has("automotive")) segments.add("Automotive");

    const sample = matching.find((product) => product.is_featured)
      ?? matching.find((product) => product.is_new_arrival)
      ?? matching[0];

    return {
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      logoUrl: brand.logo_url,
      productCount: matching.length,
      image: sample ? imageFor(sample) : null,
      productName: sample?.name,
      productSlug: sample?.slug,
      segments: [...segments],
      featured: brand.is_featured,
      newCount: matching.filter((product) => product.is_new_arrival).length,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));
}

export default async function BrandsPage() {
  const [brands, catalog] = await Promise.all([
    serverApi.brands(),
    serverApi.products({ page: 1, page_size: 500 }),
  ]);
  const profiles = buildProfiles(brands, catalog.items);
  const active = profiles.filter((brand) => brand.productCount > 0);
  const featured = active
    .filter((brand) => brand.featured && !/dukaanhub|premium choice/i.test(brand.name))
    .sort((a, b) => b.productCount + b.newCount * 2 - (a.productCount + a.newCount * 2))
    .slice(0, 3);
  const popular = [...active].sort((a, b) => b.productCount - a.productCount).slice(0, 6);
  const trending = [...active].sort((a, b) => b.newCount + Number(b.featured) * 2 - (a.newCount + Number(a.featured) * 2) || b.productCount - a.productCount).slice(0, 6);
  const worlds = [
    { name: "Luxury", copy: "Legacy houses and enduring design.", brands: active.filter((brand) => brand.segments.includes("Luxury")).slice(0, 4) },
    { name: "Technology", copy: "Tools that move daily life forward.", brands: active.filter((brand) => brand.segments.includes("Technology")).slice(0, 4) },
    { name: "Fashion", copy: "Personal style, from icons to independents.", brands: active.filter((brand) => brand.segments.includes("Fashion")).slice(0, 4) },
    { name: "Beauty", copy: "Considered care and expressive essentials.", brands: active.filter((brand) => brand.segments.includes("Beauty")).slice(0, 4) },
    { name: "Sports", copy: "Performance-minded names and outdoor gear.", brands: active.filter((brand) => brand.segments.includes("Sports")).slice(0, 4) },
  ].filter((world) => world.brands.length);

  return (
    <div className="container-page pb-24 pt-6 sm:pt-8">
      <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500" aria-label="Breadcrumb">
        <Link href="/" className="transition hover:text-neutral-950">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-neutral-950">Brands</span>
      </nav>

      <section className="mt-6 grid overflow-hidden rounded-[2rem] border border-neutral-200 bg-white lg:min-h-[610px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">The brand index</p>
          <h1 className="mt-5 text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-neutral-950 sm:text-6xl lg:text-7xl">Meet the names behind the things you love.</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-neutral-600">Browse global icons, category specialists and smaller labels through a directory designed for discovery—not scrolling fatigue.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#all-brands" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Find a brand <ArrowRight size={16} /></Link>
            <Link href="/products" className="inline-flex min-h-12 items-center rounded-full border border-neutral-200 px-5 text-sm font-semibold text-neutral-800 transition hover:border-neutral-950">Shop all products</Link>
          </div>
          <div className="mt-10 flex gap-8 border-t border-neutral-100 pt-6">
            <p><span className="block text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{active.length}</span><span className="mt-1 block text-xs text-neutral-500">Active brands</span></p>
            <p><span className="block text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{catalog.total}</span><span className="mt-1 block text-xs text-neutral-500">Products</span></p>
          </div>
        </div>

        <div className="grid min-h-[500px] gap-2 bg-neutral-100 p-2 sm:grid-cols-2 lg:min-h-0 lg:grid-rows-2">
          {featured.map((brand, index) => (
            <Link key={brand.id} href={`/products?brand=${encodeURIComponent(brand.slug)}`} className={`group relative min-h-60 overflow-hidden rounded-[1.45rem] bg-white ${index === 0 ? "sm:row-span-2" : ""}`}>
              {brand.image ? <div className={`absolute inset-x-5 bottom-14 top-14 ${index === 0 ? "sm:inset-x-8 sm:bottom-20 sm:top-24" : ""}`}><AssetImage src={brand.image} alt="" fill priority={index === 0} sizes={index === 0 ? "(min-width: 1024px) 28vw, 50vw" : "(min-width: 1024px) 22vw, 50vw"} className="object-contain p-3 drop-shadow-[0_20px_22px_rgba(0,0,0,0.14)] transition duration-700 group-hover:scale-[1.04]" /></div> : null}
              <div className="relative flex h-full min-h-60 flex-col justify-between p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <BrandMark name={brand.name} logoUrl={brand.logoUrl} size={index === 0 ? "md" : "sm"} />
                  <ArrowUpRight size={17} className="text-neutral-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-950" />
                </div>
                <div>
                  <p className="text-lg font-semibold tracking-[-0.035em] text-neutral-950">{brand.name}</p>
                  <p className="mt-1 text-xs text-neutral-500">{brand.productCount} products · Featured story</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length ? (
        <section className="py-20 md:py-28">
          <SectionHeading eyebrow="Featured stories" title="More than a logo." description="Step into focused collections from brands shaping how we live, dress and connect." />
          <div className="grid gap-4 lg:grid-cols-3">
            {featured.map((brand, index) => (
              <Link key={brand.id} href={`/products?brand=${encodeURIComponent(brand.slug)}`} className={`group relative min-h-[460px] overflow-hidden rounded-3xl ${index === 0 ? "bg-[#edf1ef]" : index === 1 ? "bg-[#f1efec]" : "bg-[#eef0f3]"}`}>
                {brand.image ? <div className="absolute inset-x-8 bottom-28 top-20"><AssetImage src={brand.image} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-contain p-3 drop-shadow-[0_22px_24px_rgba(0,0,0,0.14)] transition duration-700 group-hover:scale-[1.04]" /></div> : null}
                <div className="relative flex min-h-[460px] flex-col justify-between p-7">
                  <div className="flex items-start justify-between">
                    <BrandMark name={brand.name} logoUrl={brand.logoUrl} />
                    <span className="rounded-full bg-white/80 px-3 py-1.5 text-[11px] font-semibold text-neutral-600 backdrop-blur">{brand.segments[0] || "Featured"}</span>
                  </div>
                  <div className="flex items-end justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-2xl font-semibold tracking-[-0.045em] text-neutral-950">{brand.name}</h2>
                      <p className="mt-2 line-clamp-1 text-sm text-neutral-600">{brand.productName}</p>
                      <p className="mt-1 text-xs text-neutral-500">Explore {brand.productCount} products</p>
                    </div>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--accent)] shadow-sm transition group-hover:bg-[color:var(--accent)] group-hover:text-white"><ArrowRight size={17} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className={featured.length ? "pb-20 md:pb-28" : "py-20 md:py-28"}>
        <SectionHeading eyebrow="Brand worlds" title="Explore by what moves you." description="From enduring craft to everyday performance, find brands through the ideas they represent." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {worlds.map((world) => (
            <a key={world.name} href={`#all-brands`} className="group flex min-h-64 flex-col justify-between rounded-3xl border border-neutral-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">{world.brands.length} featured names</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{world.name}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-500">{world.copy}</p>
              </div>
              <div className="mt-8">
                <div className="flex -space-x-2">
                  {world.brands.slice(0, 4).map((brand) => <span key={brand.id} className="rounded-2xl bg-white ring-2 ring-white"><BrandMark name={brand.name} logoUrl={brand.logoUrl} size="sm" /></span>)}
                </div>
                <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-neutral-700">Explore {world.name.toLowerCase()} <ArrowRight size={14} className="transition group-hover:translate-x-0.5" /></p>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="grid gap-4 pb-20 md:grid-cols-2 md:pb-28">
        <div className="rounded-3xl bg-neutral-950 p-7 text-white sm:p-9">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/55"><Flame size={15} /> Popular now</div>
          <div className="mt-7 divide-y divide-white/10">
            {popular.slice(0, 5).map((brand, index) => (
              <Link key={brand.id} href={`/products?brand=${encodeURIComponent(brand.slug)}`} className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span className="w-6 text-xs font-medium text-white/35">{String(index + 1).padStart(2, "0")}</span>
                <span className="flex-1 text-base font-semibold">{brand.name}</span>
                <span className="text-xs text-white/45">{brand.productCount} products</span>
                <ArrowUpRight size={16} className="text-white/35 transition group-hover:text-white" />
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-[#edf3ef] p-7 sm:p-9">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]"><Sparkles size={15} /> Trending brands</div>
          <div className="mt-7 divide-y divide-neutral-950/10">
            {trending.slice(0, 5).map((brand) => (
              <Link key={brand.id} href={`/products?brand=${encodeURIComponent(brand.slug)}`} className="group flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <BrandMark name={brand.name} logoUrl={brand.logoUrl} size="sm" />
                <span className="min-w-0 flex-1"><span className="block truncate text-base font-semibold text-neutral-950">{brand.name}</span><span className="mt-1 block text-xs text-neutral-500">{brand.newCount ? `${brand.newCount} new arrivals` : `${brand.productCount} products`}</span></span>
                <ArrowUpRight size={16} className="text-neutral-400 transition group-hover:text-neutral-950" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <BrandExplorer brands={profiles} />
    </div>
  );
}
