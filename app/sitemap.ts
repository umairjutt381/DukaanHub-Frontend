import type { MetadataRoute } from "next";

import { serverApi } from "@/lib/api/server";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = [
    "",
    "/products",
    "/categories",
    "/deals",
    "/new-arrivals",
    "/best-sellers",
    "/featured-products",
    "/brands",
    "/about",
    "/contact",
    "/faqs",
    "/privacy-policy",
    "/terms-conditions",
    "/return-policy",
    "/shipping-policy"
  ];
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = routes.map((route) => ({ url: `${siteUrl}${route}`, lastModified: now }));

  try {
    const [catalog, categories] = await Promise.all([
      serverApi.products({ page: 1, page_size: 500 }),
      serverApi.categories()
    ]);
    return [
      ...staticEntries,
      ...categories.map((category) => ({ url: `${siteUrl}/category/${category.slug}`, lastModified: now })),
      ...catalog.items.map((product) => ({ url: `${siteUrl}/product/${product.slug}`, lastModified: now }))
    ];
  } catch {
    return staticEntries;
  }
}
