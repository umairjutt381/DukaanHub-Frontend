"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Truck, Wrench } from "lucide-react";

import { AssetImage } from "@/components/ui/asset-image";
import type { Brand, Category, Product } from "@/lib/types";
import { formatCurrency, resolveAssetUrl } from "@/lib/utils";

const slides = [
  { cover: "/template/img/slider-1-cover.jpg", product: "/template/img/slider-1-product.png", eyebrow: "The complete store", title: "Work beautifully.", copy: "Technology, home and everyday essentials in one trusted place.", align: "right" },
  { cover: "/template/img/slider-2-cover.jpg", product: "/template/img/slider-2-product.png", eyebrow: "New at DukaanHub", title: "Made for your day.", copy: "Discover thoughtful products selected for life across Pakistan.", align: "left" },
  { cover: "/template/img/slider-3-cover.jpg", product: "/template/img/slider-3-product.png", eyebrow: "Customer favourites", title: "Better choices, simply.", copy: "Compare trusted products and shop with confidence.", align: "right" },
] as const;

function productImage(product?: Product | null) {
  return resolveAssetUrl(product?.images?.find((image) => image.is_primary)?.url || product?.images?.[0]?.url);
}

function ProductTile({ product }: { product: Product }) {
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  return (
    <article className="group relative border-b border-r border-[#d9dee2] bg-white p-5 text-center transition hover:z-10 hover:shadow-[0_8px_28px_rgba(0,0,0,.12)]">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative mx-auto aspect-square w-full max-w-[190px]">
          <AssetImage src={productImage(product)} alt={product.name} fill sizes="190px" className="object-contain p-3 transition duration-500 group-hover:scale-105" />
        </div>
        {discount ? <span className="absolute right-4 top-4 bg-[#3b4248] px-2 py-1 text-[11px] font-bold text-white">{discount}% OFF</span> : null}
        <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-semibold text-[#333]">{product.name}</h3>
        <p className="mt-1 line-clamp-1 text-xs text-[#8a8f93]">{product.category?.name || product.brand?.name || "DukaanHub collection"}</p>
        <div className="mt-2 flex items-baseline justify-center gap-2">
          <span className="text-base font-semibold text-[#00acac]">{formatCurrency(product.price)}</span>
          {product.compare_at_price ? <span className="text-xs text-[#aaa] line-through">{formatCurrency(product.compare_at_price)}</span> : null}
        </div>
      </Link>
    </article>
  );
}

export function TemplateHome({ categories, products, brands }: { categories: Category[]; products: Product[]; brands: Brand[] }) {
  const [slide, setSlide] = useState(0);
  const featured = useMemo(() => {
    const preferred = products.filter((product) => product.is_featured || product.is_deal || product.is_best_seller);
    return (preferred.length ? preferred : products).slice(0, 8);
  }, [products]);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, []);

  const active = slides[slide];
  const promotions = [
    { title: categories[0]?.name || "Electronics", copy: "A better way to upgrade.", image: "/template/img/iphone-se.png", href: categories[0] ? `/category/${categories[0].slug}` : "/products", dark: true },
    { title: categories[1]?.name || "Smart accessories", copy: "Useful, refined, ready.", image: "/template/img/apple-watch.png", href: categories[1] ? `/category/${categories[1].slug}` : "/products" },
    { title: categories[2]?.name || "Home essentials", copy: "Designed around your day.", image: "/template/img/mac-accessories.png", href: categories[2] ? `/category/${categories[2].slug}` : "/products" },
    { title: brands[0]?.name || "Premium picks", copy: "Trusted products, fair value.", image: "/template/img/mac-pro.png", href: brands[0] ? `/products?brand=${encodeURIComponent(brands[0].slug)}` : "/products", dark: true },
  ];

  return (
    <div className="bg-[#eef1f2] text-[#333]">
      <section className="container-page relative min-h-[410px] overflow-hidden bg-[#111] text-white sm:min-h-[500px]">
        <AssetImage key={active.cover} src={active.cover} fallbackSrc={active.cover} alt="" fill priority unoptimized sizes="100vw" className="object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-black/35" />
        <div className="relative z-10 flex min-h-[410px] items-center sm:min-h-[500px]">
          <div className={`max-w-xl py-16 ${active.align === "left" ? "ml-auto" : ""}`}>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#35d5d5]">{active.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-light tracking-[-.035em] sm:text-6xl">{active.title}</h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/80 sm:text-base">{active.copy}</p>
            <Link href="/products" className="mt-7 inline-flex min-h-11 items-center gap-2 border border-white/65 px-5 text-sm font-semibold transition hover:border-[#00acac] hover:bg-[#00acac]">Shop the collection <ArrowRight size={15} /></Link>
          </div>
          <div className={`absolute bottom-0 hidden h-[88%] w-[46%] lg:block ${active.align === "left" ? "left-5" : "right-5"}`}>
            <AssetImage key={active.product} src={active.product} fallbackSrc={active.product} alt="" fill unoptimized sizes="46vw" className="object-contain object-bottom drop-shadow-[0_24px_35px_rgba(0,0,0,.35)]" />
          </div>
        </div>
        <button type="button" aria-label="Previous promotion" onClick={() => setSlide((slide - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center text-white/60 transition hover:text-white"><ChevronLeft size={30} /></button>
        <button type="button" aria-label="Next promotion" onClick={() => setSlide((slide + 1) % slides.length)} className="absolute right-4 top-1/2 z-20 grid size-10 -translate-y-1/2 place-items-center text-white/60 transition hover:text-white"><ChevronRight size={30} /></button>
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">{slides.map((item, index) => <button key={item.cover} type="button" onClick={() => setSlide(index)} aria-label={`Show promotion ${index + 1}`} className={`h-1.5 transition-all ${index === slide ? "w-7 bg-[#00acac]" : "w-3 bg-white/60"}`} />)}</div>
      </section>

      <section className="container-page py-10 sm:py-12">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-baseline gap-3"><h2 className="text-xl font-semibold">Exclusive promotions</h2><span className="text-xs text-[#9a9fa3]">Selected for DukaanHub customers</span></div>
          <Link href="/deals" className="border border-[#ccd1d4] bg-white px-4 py-2 text-xs font-semibold text-[#687078] transition hover:border-[#00acac] hover:text-[#00acac]">SHOW ALL</Link>
        </div>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-[1.65fr_.8fr_.8fr] lg:grid-rows-2">
          {promotions.map((item, index) => <Link key={item.title} href={item.href} className={`group relative min-h-[190px] overflow-hidden p-7 ${index === 0 ? "md:row-span-2 lg:min-h-[390px]" : ""} ${item.dark ? "bg-[#3b4248] text-white" : "bg-white text-[#3b4248]"}`}><div className="relative z-10 max-w-[58%]"><h3 className={`${index === 0 ? "text-4xl font-light" : "text-xl font-normal"}`}>{item.title}</h3><p className={`mt-3 text-sm ${item.dark ? "text-white/65" : "text-[#8c9296]"}`}>{item.copy}</p><span className="mt-6 inline-flex border border-current px-3 py-1.5 text-xs opacity-70 transition group-hover:border-[#00acac] group-hover:bg-[#00acac] group-hover:text-white group-hover:opacity-100">View more</span></div><span className="absolute bottom-0 right-0 top-5 w-[52%]"><AssetImage src={item.image} alt="" fill sizes="300px" className="object-contain object-bottom transition duration-500 group-hover:scale-105" /></span></Link>)}
        </div>
      </section>

      <section className="border-y border-[#d9dee2] bg-white">
        <div className="container-page py-10 sm:py-12">
          <div className="mb-5 flex items-center justify-between"><h2 className="text-xl font-semibold">Featured products</h2><Link href="/products" className="text-xs font-semibold text-[#00acac]">View all <ArrowRight className="inline size-3.5" /></Link></div>
          <div className="grid border-l border-t border-[#d9dee2] sm:grid-cols-2 lg:grid-cols-4">{featured.map((product) => <ProductTile key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="bg-white py-9">
        <div className="container-page grid gap-7 md:grid-cols-3">
          {[{ icon: Truck, title: "Nationwide delivery", copy: "Reliable delivery across Pakistan." }, { icon: ShieldCheck, title: "Secure shopping", copy: "Protected accounts and trusted checkout." }, { icon: Wrench, title: "Customer care", copy: "Support when you need a hand." }].map(({ icon: Icon, title, copy }) => <div key={title} className="flex items-center gap-4"><Icon className="size-9 text-[#9aa0a4]" strokeWidth={1.5} /><div><h2 className="text-sm font-semibold">{title}</h2><p className="mt-1 text-xs text-[#8b9195]">{copy}</p></div></div>)}
        </div>
      </section>
    </div>
  );
}
