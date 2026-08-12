const AUTH_RETURN_KEY = "dukaanhub_auth_return_to";

const isAuthPath = (pathname: string) => pathname === "/login" || pathname === "/register" || pathname.startsWith("/auth/");

export function sanitizeReturnTo(value: string | null | undefined, fallback = "/account") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const url = new URL(value, origin);
    if (url.origin !== origin || isAuthPath(url.pathname)) return fallback;
    return `${url.pathname}${url.search}${url.hash}` || fallback;
  } catch {
    return fallback;
  }
}

export function getAuthReturnTo() {
  if (typeof window === "undefined") return "/account";

  const fromQuery = new URLSearchParams(window.location.search).get("returnTo");
  if (fromQuery) return sanitizeReturnTo(fromQuery);

  const stored = window.sessionStorage.getItem(AUTH_RETURN_KEY);
  if (stored) return sanitizeReturnTo(stored);

  if (document.referrer) {
    try {
      const referrer = new URL(document.referrer);
      if (referrer.origin === window.location.origin && !isAuthPath(referrer.pathname)) {
        return sanitizeReturnTo(`${referrer.pathname}${referrer.search}${referrer.hash}`);
      }
    } catch {
      // Ignore malformed referrers and use the account fallback.
    }
  }

  return "/account";
}

export function rememberAuthReturnTo(value: string) {
  if (typeof window !== "undefined") window.sessionStorage.setItem(AUTH_RETURN_KEY, sanitizeReturnTo(value));
}

export function authHref(path: "/login" | "/register", returnTo: string) {
  return `${path}?returnTo=${encodeURIComponent(sanitizeReturnTo(returnTo))}`;
}
