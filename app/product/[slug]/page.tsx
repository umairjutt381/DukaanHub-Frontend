import { notFound } from "next/navigation";

import { ProductDetailExperience } from "@/components/product/product-detail-experience";
import { ServerApiError, serverApi } from "@/lib/api/server";
import type { Product } from "@/lib/types";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product: Product;
  try {
    product = await serverApi.product(slug);
  } catch (error) {
    if (error instanceof ServerApiError && error.status === 404) return notFound();
    throw error;
  }

  const related = await serverApi.products({ category: product.category?.slug || "", page_size: 9 });

  return (
    <ProductDetailExperience
      product={product}
      related={related.items.filter((item) => item.id !== product.id).slice(0, 8)}
    />
  );
}
