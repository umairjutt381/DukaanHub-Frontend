import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { BrandMark } from "@/components/brands/brand-mark";
import type { Brand, Product } from "@/lib/types";

export function BrandRow({ brands, products = [] }: { brands: Brand[]; products?: Product[] }) {
  const brandDetails = brands
    .map((brand) => {
      const matching = products.filter((product) => product.brand?.id === brand.id || product.brand?.slug === brand.slug);
      return { brand, count: matching.length };
    })
    .filter(({ count }) => !products.length || count > 0)
    .sort((a, b) => b.count - a.count || a.brand.name.localeCompare(b.brand.name))
    .slice(0, 8);

  if (!brandDetails.length) return null;

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-200 sm:grid-cols-3 lg:grid-cols-4">
      {brandDetails.map(({ brand, count }) => (
        <Link href={`/products?brand=${encodeURIComponent(brand.slug)}`} key={brand.id} className="group flex min-h-40 flex-col justify-between bg-white p-5 transition hover:bg-neutral-50 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <BrandMark name={brand.name} logoUrl={brand.logo_url} size="sm" />
            <ArrowUpRight size={17} className="text-neutral-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-950" />
          </div>
          <div className="mt-7">
            <p className="text-base font-semibold tracking-[-0.025em] text-neutral-950">{brand.name}</p>
            <p className="mt-1 text-xs text-neutral-500">{count ? `${count} products` : "Explore the collection"}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
