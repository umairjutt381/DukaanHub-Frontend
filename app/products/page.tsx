import { CatalogPage } from "@/components/catalog/catalog-page";
import type { CatalogSearchParams } from "@/lib/catalog";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const query = await searchParams;

  return (
    <CatalogPage
      route="/products"
      eyebrow="DukaanHub catalog"
      title="Our Store"
      description="Explore trusted products across technology, home, fashion and everyday essentials."
      initialQuery={query}
      promo={{ label: "Fresh perspective", title: "Find the useful, the beautiful and the unexpectedly good.", description: "A rotating edit of well-rated products across technology, home, style and everyday essentials.", href: "/best-sellers", linkLabel: "Shop customer favourites" }}
    />
  );
}
