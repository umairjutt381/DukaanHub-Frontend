import { cn } from "@/lib/utils";
import { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("min-h-12 w-full rounded-xl border border-transparent bg-[color:var(--canvas-deep)] px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition duration-200 placeholder:text-[color:var(--muted-light)] hover:bg-[#f0f3f0] focus:border-[color:var(--line-dark)] focus:bg-white focus:ring-4 focus:ring-black/[0.035]", className)} />;
}
