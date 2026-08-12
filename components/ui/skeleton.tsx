import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("relative overflow-hidden rounded-2xl bg-[#f1f3f1] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent", className)} />;
}
