"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { clearStoredSession, getStoredToken, useAuthStore } from "@/lib/store/auth";

export function useAccountSession() {
  const router = useRouter();
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    if (!getStoredToken()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [hydrate, router]);

  const signOut = useCallback(() => {
    clearStoredSession();
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  const handleUnauthorized = useCallback(() => {
    clearStoredSession();
    clearAuth();
    router.replace("/login");
  }, [clearAuth, router]);

  return { ready, user, signOut, handleUnauthorized };
}

export function getRequestStatus(error: unknown) {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = (error as { response?: { status?: number } }).response;
  return response?.status;
}
