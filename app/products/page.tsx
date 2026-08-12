import { CatalogPage } from "@/components/catalog/catalog-page";
import type { CatalogSearchParams } from "@/lib/catalog";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const query = await searchParams;

  return (
    <CatalogPage
      route="/products"
      eyebrow="The complete store"
      title="Everything, thoughtfully organised."
      description="Explore the full DukaanHub catalog with useful filters, verified availability and products selected for life across Pakistan."
      initialQuery={query}
      promo={{ label: "Fresh perspective", title: "Find the useful, the beautiful and the unexpectedly good.", description: "A rotating edit of well-rated products across technology, home, style and everyday essentials.", href: "/best-sellers", linkLabel: "Shop customer favourites" }}
    />
  );
}
