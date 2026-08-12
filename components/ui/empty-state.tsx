import { PackageOpen } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]">
        <PackageOpen size={22} />
      </span>
      <h3 className="mt-5 text-xl font-bold tracking-[-0.025em] text-[color:var(--ink)]">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
