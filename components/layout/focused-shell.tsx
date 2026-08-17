"use client";

import Link from "next/link";
import { ArrowLeft, CircleHelp, LockKeyhole } from "lucide-react";

import { BrandLogo } from "./brand-logo";

export type FocusedShellContext = {
  title: string;
  secure?: boolean;
  support?: boolean;
};

type FocusedShellProps = FocusedShellContext & {
  children: React.ReactNode;
};

export function FocusedShell({ children, title, secure = false, support = false }: FocusedShellProps) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-white"
      style={{ "--sticky-shell-offset": "6rem" } as React.CSSProperties}
    >
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-[color:var(--accent)] px-4 py-3 text-sm font-bold text-white transition focus:translate-y-0"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        <div className="container-page flex h-[72px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            <Link
              href="/"
              aria-label="DukaanHub home"
              className="shrink-0 rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-4"
            >
              <span className="sm:hidden"><BrandLogo compact /></span>
              <span className="hidden sm:inline-flex"><BrandLogo /></span>
            </Link>

            <span className="h-7 w-px shrink-0 bg-[color:var(--line)]" aria-hidden="true" />
            <div className="flex min-w-0 items-center gap-2">
              {secure ? <LockKeyhole size={14} className="hidden shrink-0 text-[color:var(--accent)] sm:block" aria-hidden="true" /> : null}
              <p className="truncate text-sm font-semibold tracking-[-0.015em] text-[color:var(--ink-soft)] sm:text-[0.95rem]">
                {title}
              </p>
            </div>
          </div>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2" aria-label="Focused page navigation">
            {!support ? (
              <Link
                href="/contact"
                className="hidden min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[color:var(--muted)] transition hover:bg-[color:var(--canvas-deep)] hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] md:inline-flex"
              >
                <CircleHelp size={16} aria-hidden="true" />
                Help
              </Link>
            ) : null}

            <Link
              href="/"
              aria-label="Continue shopping"
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-px hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 sm:px-4"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Continue shopping</span>
              <span className="sm:hidden">Shop</span>
            </Link>
          </nav>
        </div>
      </header>

      <main id="main-content" className="min-h-0 flex-1 bg-white">
        {children}
      </main>

      <footer className="border-t border-[color:var(--line)] bg-[#fafbfa]" aria-label="Focused page footer">
        <div className="container-page flex min-h-16 flex-col justify-center gap-2 py-4 text-xs text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <p>&copy; 2026 DukaanHub</p>
          <nav className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="Legal and support">
            <Link className="transition hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:underline" href="/privacy-policy">Privacy</Link>
            <Link className="transition hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:underline" href="/terms-conditions">Terms</Link>
            <Link className="transition hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:underline" href="/contact">Support</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
