import { CatalogPage } from "@/components/catalog/catalog-page";
import type { CatalogSearchParams } from "@/lib/catalog";

export default async function DealsPage({ searchParams }: { searchParams: Promise<CatalogSearchParams> }) {
  const query = await searchParams;
  return (
    <CatalogPage
      route="/deals"
      eyebrow="Limited-time value"
      title="Better prices. No treasure hunt."
      description="A clear, considered view of every current reduction—easy to compare and available while stock lasts."
      productQuery={{ deal: true }}
      initialQuery={query}
      emptyTitle="No active offers match"
      emptyDescription="Reset the filters or check back as new reductions are added."
      promo={{ label: "Make the saving count", title: "More value on products worth owning.", description: "We surface the strongest current offers without the noise, countdown theatre or confusing conditions.", href: "/products", linkLabel: "Explore everything" }}
    />
  );
}
