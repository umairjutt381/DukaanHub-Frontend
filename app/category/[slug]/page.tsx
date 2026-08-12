import { CatalogPage } from "@/components/catalog/catalog-page";
import type { CatalogSearchParams } from "@/lib/catalog";

function titleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<CatalogSearchParams> }) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const fallbackName = titleCase(slug);

  return (
    <CatalogPage
      route={`/category/${slug}`}
      eyebrow="Shop by category"
      title={fallbackName}
      description={`Explore standout products and everyday essentials in ${fallbackName}.`}
      categorySlug={slug}
      productQuery={{ category: slug }}
      initialQuery={query}
      emptyTitle={`Nothing in ${fallbackName} matches yet`}
      emptyDescription="Try changing your filters or explore another collection."
      promo={{ label: "Category spotlight", title: `A sharper way to shop ${fallbackName}.`, description: "Start with the customer favourites, compare the details that matter, then choose with confidence.", href: "/best-sellers", linkLabel: "See what’s popular" }}
    />
  );
}
