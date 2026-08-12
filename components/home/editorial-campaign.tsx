import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AssetImage } from "@/components/ui/asset-image";
import type { Product } from "@/lib/types";
import { resolveAssetUrl } from "@/lib/utils";

function imageFor(product?: Product) {
  return resolveAssetUrl(product?.images?.find((item) => item.is_primary)?.url || product?.images?.[0]?.url);
}

export function EditorialCampaign({ primary, secondary }: { primary?: Product; secondary?: Product }) {
  if (!primary && !secondary) return null;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
      <Link href={primary ? `/product/${primary.slug}` : "/new-arrivals"} className="group relative min-h-[520px] overflow-hidden rounded-3xl bg-[#e9eeee]">
        {primary ? <div className="absolute bottom-4 right-2 top-24 w-[72%] sm:right-10 sm:top-10"><AssetImage src={imageFor(primary)} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-contain p-4 drop-shadow-[0_24px_28px_rgba(0,0,0,0.15)] transition duration-700 group-hover:scale-[1.035]" /></div> : null}
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-transparent" />
        <div className="relative flex h-full min-h-[520px] max-w-md flex-col justify-between p-7 sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--accent)]">The new utility</p>
            <h3 className="mt-4 text-4xl font-semibold leading-[0.98] tracking-[-0.055em] text-neutral-950 sm:text-5xl">Beautifully useful.<br />Every single day.</h3>
            <p className="mt-5 max-w-sm text-sm leading-7 text-neutral-600">A focused edit of technology and everyday objects chosen to make life feel simpler.</p>
          </div>
          <span className="inline-flex w-fit min-h-11 items-center gap-2 rounded-full bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition group-hover:bg-[color:var(--accent-dark)]">Explore new arrivals <ArrowRight size={16} /></span>
        </div>
      </Link>

      <Link href={secondary ? `/product/${secondary.slug}` : "/featured-products"} className="group relative min-h-[520px] overflow-hidden rounded-3xl bg-[#f1eeee]">
        {secondary ? <div className="absolute inset-x-2 bottom-20 top-20"><AssetImage src={imageFor(secondary)} alt="" fill sizes="(min-width: 1024px) 35vw, 100vw" className="object-contain p-5 drop-shadow-[0_22px_24px_rgba(0,0,0,0.14)] transition duration-700 group-hover:scale-[1.04] group-hover:-rotate-1" /></div> : null}
        <div className="relative flex h-full min-h-[520px] flex-col justify-between p-7 sm:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Considered style</p>
            <h3 className="mt-3 max-w-xs text-3xl font-semibold leading-tight tracking-[-0.045em] text-neutral-950">Details that do the talking.</h3>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-950">{secondary?.name || "The style edit"}</p>
              <p className="mt-1 text-xs text-neutral-500">Discover the collection</p>
            </div>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--accent)] shadow-sm transition group-hover:bg-[color:var(--accent)] group-hover:text-white"><ArrowRight size={17} /></span>
          </div>
        </div>
      </Link>
    </div>
  );
}
