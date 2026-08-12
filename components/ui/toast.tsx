"use client";

import { createContext, useContext, useMemo, useState } from "react";

type Toast = { id: string; title: string; message?: string };

const ToastContext = createContext<{ notify: (title: string, message?: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = (title: string, message?: string) => {
    const toast = { id: crypto.randomUUID(), title, message };
    setToasts((current) => [...current, toast]);
    window.setTimeout(() => setToasts((current) => current.filter((item) => item.id !== toast.id)), 2800);
  };
  const value = useMemo(() => ({ notify }), []);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" aria-atomic="false" className="fixed inset-x-4 top-4 z-[90] mx-auto w-[min(24rem,calc(100vw-2rem))] space-y-3 sm:inset-x-auto sm:right-5 sm:mx-0">
        {toasts.map((toast) => (
          <div key={toast.id} className="rounded-2xl bg-[color:var(--ink)] px-5 py-4 text-white shadow-[var(--shadow-strong)] ring-1 ring-white/10">
            <p className="font-semibold">{toast.title}</p>
            {toast.message && <p className="mt-1 text-sm leading-6 text-white/65">{toast.message}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
