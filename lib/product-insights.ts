import type { Product } from "@/lib/types";

function productCopy(product: Product) {
  return [product.description, product.specifications, product.tags].filter(Boolean).join(" ");
}

export function shippingEstimate(product: Product) {
  const match = product.specifications?.match(/(?:^|;)\s*Shipping\s*:\s*([^;]+)/i);
  return match?.[1]?.trim() || null;
}

export function hasFreeShipping(product: Product) {
  return /\bfree\s+(shipping|delivery)\b/i.test(productCopy(product));
}

export function hasFastDispatch(product: Product) {
  const estimate = shippingEstimate(product);
  return Boolean(estimate && /(same[- ]day|overnight|within 24 hours|1\s*(?:-|–|to)\s*2 business days|1 business day)/i.test(estimate));
}

export function returnWindow(product: Product) {
  const match = product.specifications?.match(/(?:^|;)\s*Returns?\s*:\s*([^;]+)/i);
  return match?.[1]?.trim() || null;
}
