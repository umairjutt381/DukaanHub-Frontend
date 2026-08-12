import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Check, ChevronRight, LockKeyhole, RotateCcw, ShieldCheck, Truck } from "lucide-react";

import { cn } from "@/lib/utils";

export function CommerceBreadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium text-[color:var(--muted)]">
      <Link href="/" className="rounded-md py-2 transition hover:text-[color:var(--ink)]">Home</Link>
      <ChevronRight size={13} aria-hidden="true" />
      <span aria-current="page" className="py-2 text-[color:var(--ink)]">{current}</span>
    </nav>
  );
}

const steps = ["Bag", "Delivery", "Confirmation"];

export function CheckoutProgress({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol aria-label="Checkout progress" className="flex w-full max-w-md items-center">
      {steps.map((step, index) => {
        const number = index + 1;
        const complete = number < current;
        const active = number === current;
        return (
          <li key={step} className={cn("flex min-w-0 items-center", index < steps.length - 1 && "flex-1")}>
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition",
                  complete && "bg-[color:var(--accent)] text-white",
                  active && "bg-[color:var(--accent)] text-white",
                  !complete && !active && "bg-[color:var(--canvas-deep)] text-[color:var(--muted)]"
                )}
              >
                {complete ? <Check size={13} aria-hidden="true" /> : number}
              </span>
              <span className={cn("hidden text-xs font-semibold sm:block", active ? "text-[color:var(--ink)]" : "text-[color:var(--muted)]")}>{step}</span>
            </span>
            {index < steps.length - 1 ? <span className={cn("mx-3 h-px min-w-4 flex-1", number < current ? "bg-[color:var(--accent)]" : "bg-[color:var(--line)]")} aria-hidden="true" /> : null}
          </li>
        );
      })}
    </ol>
  );
}

const trustItems = [
  { icon: ShieldCheck, title: "Protected checkout", copy: "Your details stay private." },
  { icon: Truck, title: "Tracked delivery", copy: "Updates from dispatch to door." },
  { icon: RotateCcw, title: "Straightforward support", copy: "Help when plans change." }
];

export function CommerceTrustStrip({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("grid gap-px overflow-hidden rounded-[20px] bg-[color:var(--line)] ring-1 ring-[color:var(--line)]", compact ? "grid-cols-1" : "sm:grid-cols-3")}>
      {trustItems.map((item) => (
        <div key={item.title} className={cn("flex items-start gap-3 bg-white", compact ? "p-4" : "p-5")}>
          <item.icon size={18} className="mt-0.5 shrink-0 text-[color:var(--accent)]" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold tracking-[-0.01em] text-[color:var(--ink)]">{item.title}</p>
            <p className="mt-0.5 text-xs leading-5 text-[color:var(--muted)]">{item.copy}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommerceEmptyState({
  icon: Icon,
  eyebrow,
  title,
  description,
  children
}: {
  icon: LucideIcon;
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative mx-auto mt-12 max-w-3xl overflow-hidden rounded-[28px] bg-[color:var(--canvas-deep)] px-6 py-16 text-center sm:px-12 sm:py-20">
      <div aria-hidden="true" className="absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 blur-2xl" />
      <div className="relative">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-white text-[color:var(--ink)] shadow-[var(--shadow-xs)] ring-1 ring-black/[0.04]"><Icon size={23} /></span>
        {eyebrow ? <p className="eyebrow mt-6">{eyebrow}</p> : null}
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[color:var(--ink)] sm:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[color:var(--muted)] sm:text-base">{description}</p>
        {children ? <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">{children}</div> : null}
      </div>
    </div>
  );
}

export function SecureLabel() {
  return <span className="inline-flex min-h-9 items-center gap-2 rounded-full bg-[color:var(--canvas-deep)] px-3.5 text-xs font-semibold text-[color:var(--ink)]"><LockKeyhole size={13} className="text-[color:var(--accent)]" aria-hidden="true" /> Secure checkout</span>;
}
