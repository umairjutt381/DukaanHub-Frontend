"use client";

import { usePathname } from "next/navigation";

import { Header } from "./header";
import { Footer } from "./footer";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountEntryRoute = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/google/callback"].includes(pathname);

  if (isAdminRoute || isAccountEntryRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <a href="#main-content" className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-[color:var(--accent)] px-4 py-3 text-sm font-bold text-white transition focus:translate-y-0">Skip to content</a>
      <Header />
      <main id="main-content" className="min-h-[calc(100vh-290px)] bg-[color:var(--canvas)] pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
