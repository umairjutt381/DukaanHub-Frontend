import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition duration-200 ease-out hover:-translate-y-px active:translate-y-0 active:scale-[0.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45",
        variant === "primary"
          ? "bg-[color:var(--accent)] text-white shadow-[var(--shadow-xs)] hover:bg-[color:var(--accent-dark)] hover:shadow-[var(--shadow)]"
          : "bg-white text-[color:var(--ink)] shadow-[var(--shadow-xs)] ring-1 ring-inset ring-[color:var(--line-dark)] hover:bg-[color:var(--canvas-deep)] hover:shadow-sm",
        className
      )}
    />
  );
}
