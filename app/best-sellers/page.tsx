import { CatalogPage } from "@/components/catalog/catalog-page";
import type { CatalogSearchParams } from "@/lib/catalog";

export default async function BestSellersPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const query = await searchParams;
  return (
    <CatalogPage
      route="/best-sellers"
      eyebrow="Chosen often"
      title="The products people come back for."
      description="Customer favourites with the ratings, availability and price details you need to make a confident choice."
      productQuery={{ best_seller: true }}
      initialQuery={query}
      emptyTitle="No favourites match these filters"
      emptyDescription="Remove a filter or browse the complete store."
      promo={{ label: "Loved for a reason", title: "Proven favourites, without the popularity contest.", description: "Use ratings and review counts together to find the products customers genuinely value.", href: "/featured-products", linkLabel: "Explore our edit" }}
    />
  );
}
