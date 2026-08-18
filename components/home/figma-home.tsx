"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { AssetImage } from "@/components/ui/asset-image";
import type { Brand, Category, Product } from "@/lib/types";
import { formatCurrency, resolveAssetUrl } from "@/lib/utils";

function imageFor(product?: Product | null) {
  return resolveAssetUrl(product?.images?.find((item) => item.is_primary)?.url || product?.images?.[0]?.url);
}

function discountFor(product: Product) {
  if (!product.compare_at_price || product.compare_at_price <= product.price) return 0;
  return Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100);
}

function SectionTitle({ before, accent, href }: { before: string; accent: string; href: string }) {
  return (
    <div className="mb-5 flex items-end justify-between border-b border-[#d9dee2]">
      <h2 className="relative pb-3 text-[17px] font-semibold text-[#333] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[#00acac] sm:text-[19px]">
        {before} <span className="font-bold text-[#00acac]">{accent}</span>
      </h2>
      <Link href={href} className="mb-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#687078] transition hover:text-[#00acac]">
        View All <ChevronRight size={13} />
      </Link>
    </div>
  );
}

function DealCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const discount = discountFor(product);
  const saving = product.compare_at_price ? Math.max(0, product.compare_at_price - product.price) : 0;

  return (
    <article className={`group overflow-hidden rounded-[12px] border bg-white transition duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] ${featured ? "border-[#00acac]" : "border-[#d9dee2]"}`}>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square bg-[#f1f3f4]">
          <AssetImage src={imageFor(product)} alt={product.name} fill sizes="(min-width: 1024px) 220px, 45vw" className="object-contain p-5 transition duration-500 group-hover:scale-105" />
          {discount ? (
            <span className="absolute right-0 top-0 rounded-bl-[10px] bg-[#3b4248] px-2 py-1.5 text-center text-[10px] font-bold leading-[1.05] text-white">
              {discount}%<small className="block text-[7px] font-semibold">OFF</small>
            </span>
          ) : null}
        </div>
        <div className="space-y-2 p-3.5">
          <h3 className="line-clamp-1 text-[12px] font-semibold text-[#333]">{product.name}</h3>
          <div className="flex flex-wrap items-baseline gap-2 border-b border-[#eceef3] pb-2">
            <span className="text-[13px] font-bold text-[#333]">{formatCurrency(product.price)}</span>
            {product.compare_at_price ? <span className="text-[10px] text-[#9ca2b5] line-through">{formatCurrency(product.compare_at_price)}</span> : null}
          </div>
          <p className="text-[10px] font-bold text-[#00acac]">{saving ? `Save ${formatCurrency(saving)}` : "Best value"}</p>
        </div>
      </Link>
    </article>
  );
}

export function FigmaHome({ categories, products, brands }: { categories: Category[]; products: Product[]; brands: Brand[] }) {
  const deals = useMemo(() => {
    const preferred = products.filter((product) => product.is_deal || product.compare_at_price);
    return (preferred.length ? preferred : products).slice(0, 5);
  }, [products]);
  const heroProducts = useMemo(() => {
    const preferred = products.filter((product) => product.is_featured || product.is_deal);
    return (preferred.length ? preferred : products).slice(0, 3);
  }, [products]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (heroProducts.length < 2) return;
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % heroProducts.length), 5000);
    return () => window.clearInterval(timer);
  }, [heroProducts.length]);

  const hero = heroProducts[slide] || products[0];
  const topCategories = categories.slice(0, 7);
  const brandItems = brands.slice(0, 3);
  const essentials = (products.filter((product) => /grocery|fruit|food|beauty|home/i.test(`${product.category?.name} ${product.name}`)).length
    ? products.filter((product) => /grocery|fruit|food|beauty|home/i.test(`${product.category?.name} ${product.name}`))
    : products).slice(0, 6);

  return (
    <div className="bg-[#eef1f2] pb-12 text-[#333]">
      <div className="container-page">
        <section className="relative mt-5 min-h-[265px] overflow-hidden rounded-[16px] bg-[#3b4248] text-white sm:min-h-[310px]">
          <div className="absolute inset-y-0 right-0 w-[55%] bg-[radial-gradient(circle_at_70%_45%,rgba(125,145,201,0.28),transparent_55%)]" />
          <div className="absolute -right-16 -top-24 size-80 rounded-full border border-white/10" />
          <div className="relative z-10 flex min-h-[265px] items-center px-8 py-10 sm:min-h-[310px] sm:px-20">
            <div className="max-w-[520px]">
              <p className="text-sm font-medium text-white/90">Best Deal Online on smart watches</p>
              <h1 className="mt-2 text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.04em]">SMART WEARABLE.</h1>
              <p className="mt-2 text-base font-semibold">UP to 80% OFF</p>
              <div className="mt-10 flex items-center gap-1.5">
                {heroProducts.map((product, index) => <button key={product.id} type="button" aria-label={`Show slide ${index + 1}`} onClick={() => setSlide(index)} className={`h-1.5 rounded-full bg-white transition-all ${index === slide ? "w-5" : "w-1.5 opacity-80"}`} />)}
              </div>
            </div>
          </div>
          {hero ? <Link href={`/product/${hero.slug}`} className="absolute bottom-5 right-[8%] top-5 z-10 w-[38%]"><AssetImage src={imageFor(hero)} alt={hero.name} fill priority sizes="40vw" className="object-contain drop-shadow-[0_24px_25px_rgba(0,0,0,0.35)]" /></Link> : null}
          {heroProducts.length > 1 ? <>
            <button type="button" onClick={() => setSlide((slide - 1 + heroProducts.length) % heroProducts.length)} aria-label="Previous promotion" className="absolute left-0 top-1/2 z-20 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#eef1f2] text-[#3b4248] shadow"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => setSlide((slide + 1) % heroProducts.length)} aria-label="Next promotion" className="absolute right-0 top-1/2 z-20 grid size-10 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#eef1f2] text-[#3b4248] shadow"><ChevronRight size={18} /></button>
          </> : null}
        </section>

        {deals.length ? <section className="pt-16"><SectionTitle before="Grab the best deal on" accent="Smartphones" href="/deals" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{deals.map((product, index) => <DealCard key={product.id} product={product} featured={index === 1} />)}</div></section> : null}

        {topCategories.length ? <section className="pt-16"><SectionTitle before="Shop From" accent="Top Categories" href="/categories" /><div className="grid grid-cols-3 gap-5 sm:grid-cols-4 lg:grid-cols-7">{topCategories.map((category, index) => { const product = products.find((item) => item.category?.id === category.id); return <Link key={category.id} href={`/category/${category.slug}`} className="group flex flex-col items-center gap-3 text-center"><span className={`relative block size-[76px] overflow-hidden rounded-full bg-[#f1f3f4] transition group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] sm:size-[92px] ${index === 0 ? "ring-2 ring-[#00acac]" : ""}`}><AssetImage src={resolveAssetUrl(category.image_url || imageFor(product))} alt="" fill sizes="92px" className="object-contain p-3" /></span><span className="text-[11px] font-semibold text-[#3b4248]">{category.name}</span></Link>; })}</div></section> : null}

        {brandItems.length ? <section className="pt-16"><SectionTitle before="Top Electronics" accent="Brands" href="/brands" /><div className="grid gap-4 md:grid-cols-3">{brandItems.map((brand, index) => { const product = products.find((item) => item.brand?.id === brand.id); const tones = ["bg-[#3b4248] text-white", "bg-[#00acac] text-white", "bg-[#dceff0] text-[#3b4248]"]; return <Link key={brand.id} href={`/products?brand=${encodeURIComponent(brand.slug)}`} className={`relative min-h-[150px] overflow-hidden rounded-[12px] p-5 ${tones[index]}`}><p className="inline-flex rounded-md bg-white/20 px-2 py-1 text-[10px] font-bold uppercase">{brand.name}</p><p className="mt-8 text-sm font-semibold">UP to 80% OFF</p>{product ? <span className="absolute bottom-0 right-2 top-2 w-[48%]"><AssetImage src={imageFor(product)} alt="" fill sizes="220px" className="object-contain" /></span> : null}</Link>; })}</div><div className="mt-4 flex justify-center gap-1.5"><span className="h-1.5 w-5 rounded-full bg-[#00acac]" /><span className="size-1.5 rounded-full bg-[#cbd4d7]" /><span className="size-1.5 rounded-full bg-[#cbd4d7]" /></div></section> : null}

        {essentials.length ? <section className="pt-16"><SectionTitle before="Daily" accent="Essentials" href="/products" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{essentials.map((product) => <Link key={product.id} href={`/product/${product.slug}`} className="group text-center"><span className="relative block aspect-[1.2] overflow-hidden rounded-[12px] bg-[#f1f3f4] transition group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)]"><AssetImage src={imageFor(product)} alt={product.name} fill sizes="180px" className="object-contain p-3 transition group-hover:scale-105" /></span><span className="mt-2 block truncate text-[11px] font-medium text-[#687078]">{product.name}</span><span className="mt-0.5 block text-[11px] font-bold text-[#3b4248]">Up to 50% OFF</span></Link>)}</div></section> : null}
      </div>
    </div>
  );
}
