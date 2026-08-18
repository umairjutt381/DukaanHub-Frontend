function getSiteOrigin() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredSiteUrl) return configuredSiteUrl.replace(/\/$/, "");

  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl.replace(/\/$/, "")}`;

  return "http://localhost:3000";
}

export function resolveApiBaseUrl() {
  const configuredBaseUrl = getConfiguredApiBaseUrl();
  if (/^https?:\/\//i.test(configuredBaseUrl)) return configuredBaseUrl.replace(/\/$/, "");

  if (configuredBaseUrl.startsWith("/")) {
    return new URL(configuredBaseUrl, getSiteOrigin()).toString().replace(/\/$/, "");
  }

  return configuredBaseUrl.replace(/\/$/, "");
}

export function getConfiguredApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/$/, "");
  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is required for production builds");
  }
  return "http://127.0.0.1:8001/api/v1";
}
