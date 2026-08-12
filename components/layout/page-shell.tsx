"use client";

import { usePathname } from "next/navigation";

import { Header } from "./header";
import { Footer } from "./footer";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { FocusedShell, type FocusedShellContext } from "./focused-shell";

function getFocusedShellContext(pathname: string): FocusedShellContext | null {
  if (
    pathname.startsWith("/account") ||
    ["/profile", "/address-book", "/order-history", "/notifications"].includes(pathname)
  ) {
    return { title: "My account", secure: true };
  }

  if (pathname === "/wishlist") return { title: "Saved items" };
  if (pathname === "/cart") return { title: "Shopping bag" };
  if (pathname === "/track-order") return { title: "Track an order", support: true };
  if (pathname === "/contact") return { title: "Customer care", support: true };
  if (pathname === "/faqs") return { title: "Help centre", support: true };
  if (pathname === "/checkout") return { title: "Secure checkout", secure: true };
  if (["/order-success", "/order-failed"].includes(pathname)) {
    return { title: "Order status", secure: true };
  }

  return null;
}

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountEntryRoute = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/google/callback"].includes(pathname);
  const focusedShellContext = getFocusedShellContext(pathname);

  if (isAdminRoute || isAccountEntryRoute) {
    return <>{children}</>;
  }

  if (focusedShellContext) {
    return <FocusedShell {...focusedShellContext}>{children}</FocusedShell>;
  }

  return (
    <>
      <a href="#main-content" className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-[color:var(--accent)] px-4 py-3 text-sm font-bold text-white transition focus:translate-y-0">Skip to content</a>
      <Header />
      <main id="main-content" className="min-h-[calc(100vh-290px)] bg-white pb-20 lg:pb-0">{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
