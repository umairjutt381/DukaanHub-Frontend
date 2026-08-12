import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  compact?: boolean;
  inverse?: boolean;
  priority?: boolean;
};

export function BrandLogo({ className, compact = false, inverse = false, priority = true }: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className={cn("relative h-10 w-10 shrink-0 overflow-hidden rounded-[11px] bg-white shadow-sm ring-1", inverse ? "ring-white/20" : "ring-black/10")}>
        <Image
          src="/brand/dukaanhub-logo.png"
          alt=""
          width={1536}
          height={1024}
          priority={priority}
          className="absolute left-[-30px] top-[-2px] h-auto w-[104px] max-w-none"
        />
      </span>
      {!compact ? (
        <span className="leading-none">
          <span className={cn("block text-[1.15rem] font-black tracking-[-0.05em]", inverse ? "text-white" : "text-neutral-950")}>
            Dukaan<span className={inverse ? "text-brand-300" : "text-[color:var(--accent)]"}>Hub</span>
          </span>
          <span className={cn("mt-1 block text-[0.56rem] font-bold uppercase tracking-[0.16em]", inverse ? "text-white/50" : "text-neutral-400")}>
            Sab Kuch, Ek Jagah
          </span>
        </span>
      ) : null}
    </span>
  );
}
