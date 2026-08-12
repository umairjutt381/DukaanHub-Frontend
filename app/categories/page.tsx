import Link from "next/link";
import { ArrowRight, Compass, Sparkles, Tag } from "lucide-react";

import { AssetImage } from "@/components/ui/asset-image";
import { CategoryGrid } from "@/components/home/category-grid";
import { SectionHeading } from "@/components/home/section-heading";
import { serverApi } from "@/lib/api/server";
import { resolveAssetUrl } from "@/lib/utils";

export default async function CategoriesPage() {
  const [categories, catalog] = await Promise.all([
    serverApi.categories(),
    serverApi.products({ page: 1, page_size: 500 }),
  ]);
  const products = catalog.items;
  const heroProduct = products.find((product) => product.is_featured && product.category?.slug === "home-living")
    ?? products.find((product) => product.is_featured)
    ?? products[0];
  const heroImage = resolveAssetUrl(heroProduct?.images?.find((item) => item.is_primary)?.url || heroProduct?.images?.[0]?.url);
  const brandCount = new Set(products.map((product) => product.brand?.id).filter(Boolean)).size;

  const paths = [
    { href: "/new-arrivals", icon: Sparkles, label: "New arrivals", copy: "The latest additions across every department." },
    { href: "/featured-products", icon: Compass, label: "Curated picks", copy: "A focused edit of products worth knowing." },
    { href: "/deals", icon: Tag, label: "Current offers", copy: "Strong products at a better price, while available." },
  ];

  return (
    <div className="container-page pb-24 pt-6 sm:pt-8">
      <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500" aria-label="Breadcrumb">
        <Link href="/" className="transition hover:text-neutral-950">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="text-neutral-950">Categories</span>
      </nav>

      <section className="mt-6 grid min-h-[520px] overflow-hidden rounded-[2rem] border border-neutral-200 bg-white lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">Explore every department</p>
          <h1 className="mt-5 max-w-2xl text-5xl font-semibold leading-[0.96] tracking-[-0.06em] text-neutral-950 sm:text-6xl lg:text-7xl">A clearer way into the catalog.</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-neutral-600">Start broad, discover what feels relevant, then narrow your way to exactly the right product.</p>
          <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4 border-t border-neutral-100 pt-6">
            <p><span className="block text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{catalog.total}</span><span className="mt-1 block text-xs text-neutral-500">Products</span></p>
            <p><span className="block text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{categories.length}</span><span className="mt-1 block text-xs text-neutral-500">Departments</span></p>
            <p><span className="block text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{brandCount}</span><span className="mt-1 block text-xs text-neutral-500">Active brands</span></p>
          </div>
        </div>

        <div className="relative min-h-[430px] overflow-hidden bg-[#eef1ef] lg:m-2 lg:rounded-[1.55rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_40%,rgba(255,255,255,0.95),rgba(232,237,233,0.65)_50%,rgba(221,228,223,0.9))]" />
          {heroProduct ? <div className="absolute inset-x-8 bottom-8 top-12 sm:inset-x-16"><AssetImage src={heroImage} alt={heroProduct.name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-contain p-3 drop-shadow-[0_30px_30px_rgba(0,0,0,0.16)]" /></div> : null}
          <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_16px_50px_rgba(0,0,0,0.08)] backdrop-blur sm:inset-x-6 sm:p-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Featured department</p>
              <p className="mt-1.5 text-base font-semibold text-neutral-950">{heroProduct?.category?.name || categories[0]?.name || "Curated catalog"}</p>
            </div>
            <Link href={heroProduct?.category ? `/category/${heroProduct.category.slug}` : "/products"} aria-label="Open featured department" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-white transition hover:bg-[color:var(--accent-dark)]"><ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <SectionHeading eyebrow="Departments" title="Choose your starting point." description="Each category is its own focused collection, with relevant products and fewer distractions." />
        <CategoryGrid categories={categories} products={products} directory />
      </section>

      <section>
        <SectionHeading eyebrow="Shop differently" title="Or begin with a point of view." description="Browse by what is new, what we recommend, or what offers better value today." />
        <div className="grid overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200 md:grid-cols-3">
          {paths.map((path) => (
            <Link key={path.href} href={path.href} className="group flex min-h-52 flex-col justify-between bg-white p-7 transition hover:bg-neutral-50 sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--accent-wash)] text-[color:var(--accent)]"><path.icon size={19} /></span>
                <ArrowRight size={18} className="text-neutral-300 transition group-hover:translate-x-1 group-hover:text-neutral-950" />
              </div>
              <div className="mt-10">
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-neutral-950">{path.label}</h2>
                <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">{path.copy}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
