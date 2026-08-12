import Link from "next/link";

import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/lib/types";

export function ProductGrid({ products, emptyTitle = "No products found", emptyDescription = "Try another collection or browse the full catalog." }: { products: Product[]; emptyTitle?: string; emptyDescription?: string }) {
  if (!products.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} action={<Link href="/products" className="inline-flex min-h-11 items-center rounded-lg bg-[color:var(--accent)] px-5 text-sm font-bold text-white transition hover:bg-[color:var(--accent-dark)]">Browse all products</Link>} />;
  }

  return <div className="grid grid-cols-2 gap-x-2.5 gap-y-5 sm:grid-cols-3 sm:gap-x-3.5 sm:gap-y-6 lg:grid-cols-4 xl:grid-cols-5">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div>;
}
