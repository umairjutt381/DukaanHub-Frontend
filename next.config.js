const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
const configuredApiPattern = (() => {
  if (!configuredApiUrl) return null;
  try {
    const url = new URL(configuredApiUrl);
    return { protocol: url.protocol.replace(":", ""), hostname: url.hostname, port: url.port };
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  poweredByHeader: false,
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "https", hostname: "bilalmarth7.pk" },
      { protocol: "https", hostname: "cdn.dummyjson.com" },
      ...(configuredApiPattern ? [configuredApiPattern] : [])
    ]
  }
};

module.exports = nextConfig;
