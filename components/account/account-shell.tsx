"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  MapPin,
  Package,
  ShieldCheck
} from "lucide-react";

import type { AuthUser } from "@/lib/store/auth";
import { cn } from "@/lib/utils";

const accountLinks = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/notifications", label: "Updates", icon: Bell },
  { href: "/account/security", label: "Security", icon: LockKeyhole }
] as const;

type AccountShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  meta?: React.ReactNode;
  user?: AuthUser | null;
  onSignOut: () => void;
  children: React.ReactNode;
};

function initialsFor(name?: string) {
  return (name || "DukaanHub customer")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function AccountNavigation({ user, onSignOut }: Pick<AccountShellProps, "user" | "onSignOut">) {
  const pathname = usePathname();

  return (
    <aside className="min-w-0 lg:sticky lg:top-[var(--sticky-shell-offset)] lg:h-fit lg:transition-[top] lg:duration-300">
      <div className="hidden rounded-[var(--radius-lg)] bg-[color:var(--ink)] p-5 text-white shadow-[var(--shadow)] lg:block">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-[color:var(--ink)]">
            {initialsFor(user?.full_name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.full_name || "Your account"}</p>
            <p className="mt-0.5 truncate text-xs text-white/55">{user?.email || "DukaanHub customer"}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-white/10 pt-4 text-xs text-white/55">
          <ShieldCheck size={15} className="text-emerald-400" />
          Your account details are protected
        </div>
      </div>

      <nav
        className="mt-0 flex snap-x gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mt-3 lg:block lg:overflow-visible lg:rounded-[var(--radius-lg)] lg:bg-white lg:p-2 lg:pb-2 lg:shadow-[var(--shadow-xs)] lg:ring-1 lg:ring-black/[0.055]"
        aria-label="Account navigation"
      >
        {accountLinks.map((item) => {
          const Icon = item.icon;
          const active = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-11 shrink-0 snap-start items-center gap-2.5 rounded-xl px-4 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] lg:mb-1 lg:w-full lg:px-3.5",
                active
                  ? "bg-[color:var(--accent)] text-white shadow-sm"
                  : "bg-[color:var(--canvas-deep)] text-[color:var(--muted)] hover:bg-[#eef1ee] hover:text-[color:var(--ink)] lg:bg-transparent"
              )}
            >
              <Icon size={17} aria-hidden="true" />
              {item.label}
              <ChevronRight
                size={15}
                className={cn("ml-auto hidden transition group-hover:translate-x-0.5 lg:block", active ? "text-white/50" : "text-[color:var(--muted-light)]")}
                aria-hidden="true"
              />
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onSignOut}
          className="flex min-h-11 shrink-0 snap-start items-center gap-2.5 rounded-xl bg-[color:var(--canvas-deep)] px-4 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 lg:hidden"
        >
          <LogOut size={17} aria-hidden="true" />
          Sign out
        </button>

        <button
          type="button"
          onClick={onSignOut}
          className="group hidden min-h-11 w-full items-center gap-2.5 rounded-xl px-3.5 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 lg:mt-2 lg:flex"
        >
          <LogOut size={17} aria-hidden="true" />
          Sign out
        </button>
      </nav>
    </aside>
  );
}

export function AccountShell({
  title,
  description,
  eyebrow = "My account",
  meta,
  user,
  onSignOut,
  children
}: AccountShellProps) {
  return (
    <section className="bg-white">
      <header className="border-b border-[color:var(--line)] bg-[linear-gradient(180deg,#f8faf8_0%,#ffffff_100%)]">
        <div className="container-page py-9 sm:py-12 lg:py-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-[color:var(--ink)] sm:text-5xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--muted)] sm:text-base">{description}</p>
            </div>
            {meta ? <div className="shrink-0">{meta}</div> : null}
          </div>
        </div>
      </header>

      <div className="container-page py-7 sm:py-10 lg:py-12">
        <div className="grid min-w-0 gap-7 lg:grid-cols-[264px_minmax(0,1fr)] lg:gap-10 xl:gap-12">
          <AccountNavigation user={user} onSignOut={onSignOut} />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

export function AccountCount({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-9 items-center rounded-full bg-white px-4 text-xs font-semibold text-[color:var(--ink-soft)] shadow-[var(--shadow-xs)] ring-1 ring-black/[0.06]">
      {children}
    </span>
  );
}

export function AccountSectionHeader({
  title,
  description,
  action
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--ink)]">{title}</h2>
        {description ? <p className="mt-1.5 text-sm text-[color:var(--muted)]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
