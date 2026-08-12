import { CatalogPage } from "@/components/catalog/catalog-page";
import { firstCatalogParam, type CatalogSearchParams } from "@/lib/catalog";

export default async function SearchPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const query = await searchParams;
  const term = firstCatalogParam(query.q);

  return (
    <CatalogPage
      route="/search"
      eyebrow="Search"
      title={term ? `Results for “${term}”` : "What are you looking for?"}
      description={term ? "Refine your search by category, brand, price and availability without losing your place." : "Search products, brands and categories, then narrow the results with precise filters."}
      initialQuery={query}
      emptyTitle={term ? `No matches for “${term}”` : "Start with a product, brand or category"}
      emptyDescription={term ? "Check the spelling, use fewer words or remove a filter." : "Use the search field to explore the complete catalog."}
      promo={{ label: "Not sure where to start?", title: "Begin with what customers return to most.", description: "The best-sellers collection brings together highly rated and frequently chosen products.", href: "/best-sellers", linkLabel: "Browse best sellers" }}
    />
  );
}
