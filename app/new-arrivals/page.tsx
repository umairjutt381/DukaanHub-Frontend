import { CatalogPage } from "@/components/catalog/catalog-page";
import type { CatalogSearchParams } from "@/lib/catalog";

export default async function NewArrivalsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const query = await searchParams;
  return (
    <CatalogPage
      route="/new-arrivals"
      eyebrow="Recently added"
      title="New, notable and ready to discover."
      description="The latest products to join DukaanHub, organised so the genuinely interesting things rise to the top."
      productQuery={{ new_arrival: true }}
      initialQuery={query}
      emptyTitle="No new arrivals match"
      emptyDescription="Try a broader filter or explore the complete catalog."
      promo={{ label: "The arrival edit", title: "A first look at what’s next.", description: "Explore recent additions across personal technology, home, style, beauty and the everyday.", href: "/featured-products", linkLabel: "See the curated edit" }}
    />
  );
}
