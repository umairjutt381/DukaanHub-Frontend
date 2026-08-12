import { resolveApiBaseUrl } from "@/lib/api/base-url";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(amount);
}

const apiBaseUrl = resolveApiBaseUrl();

export function resolveAssetUrl(value?: string | null, fallback = "/brand/product-placeholder.svg") {
  const source = value?.trim();
  if (!source) return fallback;

  // Uploads are stored by FastAPI, while the storefront lives on a separate port.
  // Preserve all other URLs so CMS-managed remote assets continue to work.
  if (source.startsWith("/uploads/")) {
    try {
      return new URL(source, new URL(apiBaseUrl).origin).toString();
    } catch {
      return source;
    }
  }

  return source;
}
