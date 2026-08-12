import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cn("inline-flex items-center rounded-full bg-[color:var(--accent-wash)] px-2.5 py-1 text-[0.66rem] font-bold uppercase tracking-[0.08em] text-[color:var(--accent-dark)]", className)} />;
}
