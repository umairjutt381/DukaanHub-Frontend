import Link from "next/link";
import { AlertCircle, ArrowRight, type LucideIcon } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export function AccountPageSkeleton({ variant = "list" }: { variant?: "list" | "grid" | "overview" }) {
  if (variant === "overview") {
    return (
      <div role="status" aria-label="Loading your account" className="space-y-6">
        <span className="sr-only">Loading your account…</span>
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-36" />)}
        </div>
        <Skeleton className="h-80" />
        <div className="grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div role="status" aria-label="Loading account information" className={variant === "grid" ? "grid gap-4 md:grid-cols-2" : "space-y-4"}>
      <span className="sr-only">Loading account information…</span>
      {[0, 1, 2].map((item) => <Skeleton key={item} className={variant === "grid" ? "h-64" : "h-40"} />)}
    </div>
  );
}

export function AccountEmptyState({
  icon: Icon,
  title,
  description,
  href,
  action
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] px-6 py-14 text-center sm:py-16">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[color:var(--ink)] shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055]">
        <Icon size={20} aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-[-0.025em] text-[color:var(--ink)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      <Link href={href} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">
        {action} <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

export function AccountErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-[var(--radius-lg)] bg-red-50 px-6 py-12 text-center ring-1 ring-red-100">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-red-700 shadow-sm">
        <AlertCircle size={20} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-[color:var(--ink)]">We couldn&apos;t load this right now</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">Check your connection and try once more. Your account information is safe.</p>
      <button type="button" onClick={onRetry} className="mt-5 min-h-11 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">
        Try again
      </button>
    </div>
  );
}
