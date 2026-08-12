import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AssetImage } from "@/components/ui/asset-image";
import type { Category, Product } from "@/lib/types";
import { resolveAssetUrl } from "@/lib/utils";

const categoryTones = [
  "bg-[#eef2f5]",
  "bg-[#f4f1ed]",
  "bg-[#edf3ef]",
  "bg-[#f5f2eb]",
  "bg-[#eef0f3]",
  "bg-[#f4eeee]",
  "bg-[#eef3f2]",
];

function representativeProduct(category: Category, products: Product[]) {
  return products.find((product) => product.category?.id === category.id)
    ?? products.find((product) => product.category?.slug === category.slug);
}

export function CategoryGrid({ categories, products = [], directory = false }: { categories: Category[]; products?: Product[]; directory?: boolean }) {
  if (!categories.length) return null;

  const productCounts = products.reduce<Record<string, number>>((counts, product) => {
    const slug = product.category?.slug;
    if (slug) counts[slug] = (counts[slug] || 0) + 1;
    return counts;
  }, {});

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((category, index) => {
        const product = representativeProduct(category, products);
        const image = resolveAssetUrl(category.image_url || product?.images?.find((item) => item.is_primary)?.url || product?.images?.[0]?.url);
        const isWide = false;
        const isTall = false;

        return (
          <Link
            href={`/category/${category.slug}`}
            key={category.id}
            className={`group relative isolate flex min-h-36 overflow-hidden rounded-lg border border-black/[0.035] ${categoryTones[index % categoryTones.length]}`}
          >
            {product || category.image_url ? (
              <div className="absolute bottom-0 right-0 top-8 w-[62%] transition duration-700 ease-out group-hover:scale-[1.035]">
                <AssetImage
                  src={image}
                  alt=""
                  fill
                  sizes={isWide ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="object-contain p-3 drop-shadow-[0_16px_18px_rgba(0,0,0,0.12)]"
                />
              </div>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 opacity-40" />

              <div className="relative z-10 flex w-full flex-col justify-between p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.58rem] font-bold uppercase tracking-[0.12em] text-neutral-500">
                    {productCounts[category.slug] ? `${productCounts[category.slug]} products` : "Explore department"}
                  </p>
                  <h3 className="mt-1 max-w-[8rem] text-sm font-bold leading-tight tracking-[-0.025em] text-neutral-950">{category.name}</h3>
                </div>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/85 text-neutral-950 shadow-sm backdrop-blur transition duration-300 group-hover:translate-x-1 group-hover:bg-[color:var(--accent)] group-hover:text-white">
                  <ArrowRight size={14} />
                </span>
              </div>

              <span className="text-[0.65rem] font-bold text-neutral-600 opacity-0 transition duration-300 group-hover:opacity-100">Shop now</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
