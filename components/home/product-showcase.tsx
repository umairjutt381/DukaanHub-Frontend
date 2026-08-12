import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import { AssetImage } from "@/components/ui/asset-image";
import { ProductCard } from "@/components/home/product-card";
import { formatCurrency, resolveAssetUrl } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductShowcase({ products }: { products: Product[] }) {
  if (!products.length) return null;
  const lead = products[0];
  const image = resolveAssetUrl(lead.images?.find((item) => item.is_primary)?.url || lead.images?.[0]?.url);
  const saving = lead.compare_at_price && lead.compare_at_price > lead.price ? lead.compare_at_price - lead.price : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.12fr_0.88fr]">
      <article className="group relative min-h-[360px] overflow-hidden rounded-lg bg-[#132b43] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_25%,#1b6680_0%,#132b43_48%,#0d2032_100%)]" />
        <Link href={`/product/${lead.slug}`} className="absolute inset-x-6 bottom-36 top-16 sm:inset-x-16 sm:bottom-28 sm:top-10" aria-label={`View ${lead.name}`}>
          <AssetImage src={image} alt={lead.name} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-contain p-4 drop-shadow-[0_30px_30px_rgba(0,0,0,0.36)] transition duration-700 group-hover:scale-[1.035]" />
        </Link>
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-2.5 py-1.5 text-[0.65rem] font-bold text-white/85 backdrop-blur">
          <Clock3 size={14} /> Limited offer
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 bg-gradient-to-t from-[#081521] via-[#081521]/90 to-transparent px-5 pb-5 pt-16 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pb-6">
          <div className="min-w-0 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">{lead.brand?.name || "DukaanHub"}</p>
            <h3 className="mt-2 line-clamp-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">{lead.name}</h3>
            <div className="mt-3 flex flex-wrap items-baseline gap-3">
              <span className="text-xl font-semibold">{formatCurrency(lead.price)}</span>
              {lead.compare_at_price ? <span className="text-sm text-white/45 line-through">{formatCurrency(lead.compare_at_price)}</span> : null}
              {saving ? <span className="text-xs font-semibold text-emerald-400">Save {formatCurrency(saving)}</span> : null}
            </div>
          </div>
          <Link href={`/product/${lead.slug}`} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-50">
            Shop the offer <ArrowRight size={16} />
          </Link>
        </div>
      </article>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-2">
        {products.slice(1, 5).map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </div>
  );
}
