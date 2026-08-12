import { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-xl border border-transparent bg-[color:var(--canvas-deep)] px-4 py-3 text-sm text-[color:var(--ink)] outline-none transition duration-200 placeholder:text-[color:var(--muted-light)] hover:bg-[#f0f3f0] focus:border-[color:var(--line-dark)] focus:bg-white focus:ring-4 focus:ring-black/[0.035]",
        className
      )}
    />
  );
}
