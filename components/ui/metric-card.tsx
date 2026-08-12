import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  detail,
  className
}: {
  label: string;
  value: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055]", className)}>
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--muted)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">{value}</p>
      {detail ? <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{detail}</p> : null}
    </div>
  );
}
