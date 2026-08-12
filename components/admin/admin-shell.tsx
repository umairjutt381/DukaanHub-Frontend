"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquareText,
  Package,
  Settings,
  Shapes,
  ShoppingBag,
  Store,
  Tags,
  TicketPercent,
  Users,
  X
} from "lucide-react";

import { api } from "@/lib/api/client";
import { clearStoredSession, useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const adminTheme = {
  "--admin-bg": "#f4f1e8",
  "--admin-surface": "#fffef9",
  "--admin-ink": "#10120f",
  "--admin-muted": "#687068",
  "--admin-line": "#dddcd4",
  "--admin-accent": "#212844",
  "--admin-accent-dark": "#171c31",
  "--admin-accent-soft": "#eef0f5",
  "--admin-danger": "#b42318"
} as CSSProperties;

const navigation = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }]
  },
  {
    label: "Commerce",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Categories", href: "/admin/categories", icon: Shapes },
      { label: "Brands", href: "/admin/brands", icon: Tags },
      { label: "Orders", href: "/admin/orders", icon: ShoppingBag }
    ]
  },
  {
    label: "Relationships",
    items: [
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
      { label: "Messages", href: "/admin/messages", icon: MessageSquareText }
    ]
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/admin/settings", icon: Settings }]
  }
] as const;

const pageDescriptions: Record<string, string> = {
  Dashboard: "Monitor sales, inventory, and storefront activity from one place.",
  Products: "Maintain product information, media, pricing, and availability.",
  Categories: "Organize the catalog into clear, customer-friendly collections.",
  Brands: "Manage the brands and partners represented across the storefront.",
  Orders: "Review fulfillment activity and move orders through each stage.",
  Customers: "Understand the people shopping with DukaanHub.",
  Coupons: "Create and manage promotions without losing margin visibility.",
  Messages: "Review questions and support requests from storefront visitors.",
  Settings: "Control operational values used throughout the live storefront."
};

type AccessState = "checking" | "authorized" | "redirecting";

function BrandMark() {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--admin-accent)] text-white shadow-[0_8px_24px_rgba(33,40,68,0.24)]">
      <Store size={19} />
    </span>
  );
}

function AdminNavigation({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-6" aria-label="Admin navigation">
      {navigation.map((group) => (
        <div key={group.label}>
          <p className="mb-2 px-3 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-white/35">{group.label}</p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/admin" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active ? "bg-[color:var(--admin-accent)] text-white" : "text-white/62 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  <Icon size={17} className={active ? "text-white" : "text-white/45 transition group-hover:text-white"} />
                  <span>{item.label}</span>
                  <ChevronRight size={14} className={cn("ml-auto transition", active ? "opacity-80" : "opacity-0 group-hover:opacity-50")} />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarContent({ pathname, userName, onNavigate, onSignOut }: { pathname: string; userName: string; onNavigate?: () => void; onSignOut: () => void }) {
  const initials = useMemo(
    () => userName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AD",
    [userName]
  );

  return (
    <div className="flex h-full flex-col bg-[color:var(--admin-ink)] px-4 py-5 text-white">
      <div className="flex items-center gap-3 px-2">
        <BrandMark />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold tracking-[-0.02em]">DukaanHub</p>
          <p className="text-[0.66rem] font-medium uppercase tracking-[0.15em] text-white/40">Admin workspace</p>
        </div>
      </div>

      <div className="my-5 h-px bg-white/10" />
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        <AdminNavigation pathname={pathname} onNavigate={onNavigate} />
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <Link href="/" onClick={onNavigate} className="mb-3 flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-white/58 transition hover:bg-white/[0.07] hover:text-white">
          View storefront <ArrowUpRight size={15} />
        </Link>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--admin-accent)] text-xs font-bold text-white">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{userName}</p>
            <p className="text-xs text-white/38">Administrator</p>
          </div>
          <button type="button" onClick={onSignOut} className="flex h-9 w-9 items-center justify-center rounded-lg text-white/45 transition hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AccessLoader() {
  return (
    <div style={adminTheme} className="flex min-h-screen items-center justify-center bg-[color:var(--admin-bg)] px-6 text-[color:var(--admin-ink)]">
      <div className="flex items-center gap-3 rounded-2xl border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] px-5 py-4 shadow-[0_16px_45px_rgba(16,18,15,0.08)]">
        <LoaderCircle size={19} className="animate-spin text-[color:var(--admin-accent)]" />
        <div>
          <p className="text-sm font-semibold">Securing your workspace</p>
          <p className="mt-0.5 text-xs text-[color:var(--admin-muted)]">Verifying administrator access…</p>
        </div>
      </div>
    </div>
  );
}

export function AdminShell({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    let active = true;
    const token = window.localStorage.getItem("dukaanhub_token");
    if (!token) {
      setAccessState("redirecting");
      router.replace("/admin/login");
      return () => {
        active = false;
      };
    }

    setAccessState("checking");
    api
      .get("/auth/me")
      .then((res) => {
        if (!active) return;
        if (res.data.role !== "admin") {
          clearStoredSession();
          clearAuth();
          setAccessState("redirecting");
          router.replace("/login");
          return;
        }
        setAuth(token, res.data);
        setAccessState("authorized");
      })
      .catch(() => {
        if (!active) return;
        clearStoredSession();
        clearAuth();
        setAccessState("redirecting");
        router.replace("/admin/login");
      });

    return () => {
      active = false;
    };
  }, [clearAuth, pathname, router, setAuth]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  const signOut = () => {
    clearStoredSession();
    clearAuth();
    router.push("/admin/login");
  };

  if (accessState !== "authorized") return <AccessLoader />;

  const userName = user?.full_name || "Administrator";
  const resolvedDescription = description || pageDescriptions[title] || "Manage the live DukaanHub storefront.";

  return (
    <div style={adminTheme} className="min-h-screen bg-[color:var(--admin-bg)] text-[color:var(--admin-ink)] [font-family:var(--font-sans)]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1800px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-screen overflow-hidden border-r border-black/5 lg:block">
          <SidebarContent pathname={pathname} userName={userName} onSignOut={signOut} />
        </aside>

        <div className="min-w-0">
          <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[color:var(--admin-line)] bg-[color:var(--admin-surface)]/95 px-4 backdrop-blur md:px-7 lg:hidden">
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setMobileOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--admin-line)] bg-white text-[color:var(--admin-ink)]" aria-label="Open admin navigation">
                <Menu size={18} />
              </button>
              <div>
                <p className="text-sm font-semibold">DukaanHub Admin</p>
                <p className="text-xs text-[color:var(--admin-muted)]">{title}</p>
              </div>
            </div>
            <span className="flex h-2.5 w-2.5 rounded-full bg-[color:var(--admin-accent)] ring-4 ring-[color:var(--admin-accent-soft)]" aria-label="Store online" />
          </div>

          <main className="px-4 py-5 sm:px-6 md:py-7 lg:px-8 xl:px-10">
            <header className="mb-6 flex flex-col gap-5 rounded-2xl border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] px-5 py-5 shadow-[0_10px_35px_rgba(16,18,15,0.045)] sm:px-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-[color:var(--admin-muted)]">
                  <span>Admin</span><ChevronRight size={13} /><span className="text-[color:var(--admin-ink)]">{title}</span>
                </div>
                <h1 className="text-2xl font-semibold tracking-[-0.035em] text-[color:var(--admin-ink)] [font-family:var(--font-sans)] sm:text-3xl">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--admin-muted)]">{resolvedDescription}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--admin-accent-soft)] px-3 py-2 text-xs font-semibold text-[color:var(--admin-accent-dark)]">
                  <span className="h-2 w-2 rounded-full bg-[color:var(--admin-accent)]" /> Store online
                </span>
                {actions}
                <Link href="/" className="hidden items-center gap-2 rounded-xl border border-[color:var(--admin-line)] bg-white px-3.5 py-2 text-xs font-semibold transition hover:border-[color:var(--admin-ink)] md:inline-flex">
                  Storefront <ArrowUpRight size={14} />
                </Link>
              </div>
            </header>
            <div className="min-w-0">{children}</div>
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-label="Close admin navigation" />
          <aside className="absolute inset-y-0 left-0 w-[min(86vw,320px)] overflow-hidden shadow-2xl">
            <button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/15" aria-label="Close admin navigation">
              <X size={18} />
            </button>
            <SidebarContent pathname={pathname} userName={userName} onNavigate={() => setMobileOpen(false)} onSignOut={signOut} />
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export function AdminPanel({ title, description, action, className, children }: { title: string; description?: string; action?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] shadow-[0_10px_35px_rgba(16,18,15,0.045)]", className)}>
      <div className="flex flex-col gap-3 border-b border-[color:var(--admin-line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-base font-semibold tracking-[-0.02em] text-[color:var(--admin-ink)] [font-family:var(--font-sans)]">{title}</h2>
          {description ? <p className="mt-1 text-sm text-[color:var(--admin-muted)]">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminField({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-[color:var(--admin-ink)]">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs leading-5 text-[color:var(--admin-muted)]">{hint}</span> : null}
    </label>
  );
}

export function AdminStatus({ label, tone = "neutral" }: { label: string; tone?: "success" | "warning" | "danger" | "neutral" }) {
  const styles = {
    success: "bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent-dark)]",
    warning: "bg-amber-50 text-amber-800",
    danger: "bg-red-50 text-red-700",
    neutral: "bg-black/[0.05] text-[color:var(--admin-muted)]"
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize", styles[tone])}>{label}</span>;
}

export function AdminEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"><Package size={19} /></span>
      <p className="mt-4 text-sm font-semibold text-[color:var(--admin-ink)]">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-[color:var(--admin-muted)]">{description}</p>
    </div>
  );
}

export function AdminConfirmDialog({ open, title, description, confirmLabel = "Delete", busy = false, onConfirm, onCancel }: { open: boolean; title: string; description: string; confirmLabel?: string; busy?: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="admin-confirm-title">
      <div className="w-full max-w-md rounded-2xl border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] p-6 shadow-2xl">
        <p id="admin-confirm-title" className="text-lg font-semibold tracking-[-0.025em] text-[color:var(--admin-ink)]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-[color:var(--admin-muted)]">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-[color:var(--admin-line)] px-4 py-2.5 text-sm font-semibold text-[color:var(--admin-ink)] transition hover:border-[color:var(--admin-ink)] disabled:opacity-50">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="rounded-xl bg-[color:var(--admin-danger)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-90 disabled:opacity-50">{busy ? "Working…" : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
