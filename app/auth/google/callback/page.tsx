"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api/client";
import { useAuthStore, type AuthUser } from "@/lib/store/auth";
import { getAuthReturnTo, rememberAuthReturnTo, sanitizeReturnTo } from "@/lib/auth-return";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const errorCode = new URLSearchParams(window.location.search).get("error");
    const returnTo = sanitizeReturnTo(new URLSearchParams(window.location.search).get("return_to") || getAuthReturnTo());
    rememberAuthReturnTo(returnTo);
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("access_token");
    window.history.replaceState(null, "", window.location.pathname);

    if (errorCode || !token) {
      router.replace(`/login?google_error=1&returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    api.get<AuthUser>("/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        setAuth(token, response.data);
        router.replace(response.data.role === "admin" ? "/admin" : returnTo);
      })
      .catch(() => router.replace(`/login?google_error=1&returnTo=${encodeURIComponent(returnTo)}`));
  }, [router, setAuth]);

  return null;
}
