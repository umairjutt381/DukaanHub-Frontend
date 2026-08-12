import { CatalogExperience, type CatalogExperienceProps } from "@/components/catalog/catalog-experience";
import { serverApi, type ProductQuery } from "@/lib/api/server";
import { CATALOG_FETCH_SIZE } from "@/lib/catalog";

type CatalogPageProps = Omit<CatalogExperienceProps, "products" | "categories" | "brands" | "total"> & {
  productQuery?: ProductQuery;
  categorySlug?: string;
};

export async function CatalogPage({ productQuery = {}, categorySlug, ...props }: CatalogPageProps) {
  const [data, categories, brands] = await Promise.all([
    serverApi.products({ ...productQuery, page: 1, page_size: CATALOG_FETCH_SIZE }),
    serverApi.categories(),
    serverApi.brands(),
  ]);

  const category = categorySlug ? categories.find((item) => item.slug === categorySlug) : undefined;

  return (
    <CatalogExperience
      {...props}
      title={category?.name || props.title}
      description={category?.description || props.description}
      products={data.items}
      categories={categories}
      brands={brands}
      total={data.total}
      fixedCategory={categorySlug}
    />
  );
}
