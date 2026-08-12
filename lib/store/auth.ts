import { create } from "zustand";

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  role: string;
  is_active?: boolean;
  is_verified?: boolean;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  hydrate: () => void;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};

const AUTH_STORAGE_KEY = "dukaanhub_auth";

function readStoredAuth(): { token: string; user: AuthUser | null } | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    const legacyToken = window.localStorage.getItem("dukaanhub_token");
    return legacyToken ? { token: legacyToken, user: null } : null;
  }
  try {
    const parsed = JSON.parse(raw) as { token?: string; user?: AuthUser };
    if (!parsed.token) return null;
    return { token: parsed.token, user: parsed.user ?? null };
  } catch {
    return null;
  }
}

function writeStoredAuth(token: string, user: AuthUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
  window.localStorage.setItem("dukaanhub_token", token);
}

function clearStoredAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem("dukaanhub_token");
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  hydrate: () => {
    const stored = readStoredAuth();
    set({
      token: stored?.token ?? null,
      user: stored?.user ?? null,
      hydrated: true
    });
  },
  setAuth: (token, user) => {
    writeStoredAuth(token, user);
    set({ token, user, hydrated: true });
  },
  clearAuth: () => {
    clearStoredAuth();
    set({ token: null, user: null, hydrated: true });
  }
}));

export function getStoredToken() {
  return readStoredAuth()?.token ?? null;
}

export function getStoredUser() {
  return readStoredAuth()?.user ?? null;
}

export function clearStoredSession() {
  clearStoredAuth();
}
