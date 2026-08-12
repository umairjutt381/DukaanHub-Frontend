import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("rounded-[var(--radius-lg)] bg-[color:var(--paper)] shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055]", className)} />;
}
