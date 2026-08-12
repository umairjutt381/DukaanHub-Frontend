"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Scale, X } from "lucide-react";

import { useCompareStore } from "@/lib/store/compare";

export function CompareDock() {
  const pathname = usePathname();
  const productIds = useCompareStore((state) => state.productIds);
  const clear = useCompareStore((state) => state.clear);
  const onCatalog = pathname === "/products" || pathname === "/search" || pathname.startsWith("/category/") || ["/deals", "/new-arrivals", "/best-sellers", "/featured-products"].includes(pathname);

  if (!productIds.length) return null;

  return (
    <div className={`fixed left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-2xl bg-[color:var(--accent)] p-1.5 text-white shadow-[var(--shadow-strong)] ring-1 ring-white/10 md:bottom-6 ${onCatalog ? "bottom-40" : "bottom-20"}`}>
      <Link href="/compare" className="flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition hover:bg-white/10">
        <Scale size={16} /> Compare {productIds.length} {productIds.length === 1 ? "item" : "items"} <ArrowRight size={15} />
      </Link>
      <button type="button" onClick={clear} aria-label="Clear comparison" className="flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white">
        <X size={16} />
      </button>
    </div>
  );
}
