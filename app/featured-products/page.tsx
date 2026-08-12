import { CatalogPage } from "@/components/catalog/catalog-page";
import type { CatalogSearchParams } from "@/lib/catalog";

export default async function FeaturedProductsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const query = await searchParams;
  return (
    <CatalogPage
      route="/featured-products"
      eyebrow="The DukaanHub edit"
      title="Selected with a point of view."
      description="A focused collection of products chosen for quality, usefulness, design and the value they bring to everyday life."
      productQuery={{ featured: true }}
      initialQuery={query}
      emptyTitle="The edit is being refreshed"
      emptyDescription="Explore all products while the next selection comes together."
      promo={{ label: "Our selection principles", title: "Useful first. Well considered always.", description: "Every featured product earns its place through quality, clarity, relevance or unusually strong value.", href: "/new-arrivals", linkLabel: "See what’s new" }}
    />
  );
}
