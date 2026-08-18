import { TemplateHome } from "@/components/home/template-home";
import { serverApi } from "@/lib/api/server";

export default async function HomePage() {
  const [home, catalog, brands] = await Promise.all([
    serverApi.home(),
    serverApi.products({ page: 1, page_size: 500 }),
    serverApi.brands(),
  ]);

  const products = catalog.items;
  return <TemplateHome categories={home.categories} products={products} brands={brands} />;
}
