function getSiteOrigin() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) return configuredSiteUrl.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export function resolveApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dukaan-hub-backend-o71r-gc5a1p8yv-umairjutt381s-projects.vercel.app/api/v1";
  if (/^https?:\/\//i.test(configuredBaseUrl)) return configuredBaseUrl.replace(/\/$/, "");

  if (configuredBaseUrl.startsWith("/")) {
    return new URL(configuredBaseUrl, getSiteOrigin()).toString().replace(/\/$/, "");
  }

  return configuredBaseUrl.replace(/\/$/, "");
}
