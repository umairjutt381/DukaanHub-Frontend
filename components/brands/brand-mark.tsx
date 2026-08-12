import { AssetImage } from "@/components/ui/asset-image";

function initials(name: string) {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "DH";
  return (parts.length === 1 ? parts[0].slice(0, 2) : `${parts[0][0]}${parts[parts.length - 1][0]}`).toUpperCase();
}

function usableLogo(url?: string | null) {
  if (!url) return false;
  return /\.(avif|gif|jpe?g|png|svg|webp)(\?|$)/i.test(url);
}

export function BrandMark({ name, logoUrl, size = "md", inverse = false }: { name: string; logoUrl?: string | null; size?: "sm" | "md" | "lg"; inverse?: boolean }) {
  const sizeClass = size === "lg" ? "h-20 w-20 rounded-2xl text-xl" : size === "sm" ? "h-10 w-10 rounded-xl text-xs" : "h-14 w-14 rounded-2xl text-sm";

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border font-semibold tracking-[-0.04em] ${sizeClass} ${inverse ? "border-white/15 bg-white/10 text-white" : "border-neutral-200 bg-neutral-50 text-neutral-900"}`} aria-hidden="true">
      {usableLogo(logoUrl) ? <AssetImage src={logoUrl} alt="" fill sizes={size === "lg" ? "80px" : size === "sm" ? "40px" : "56px"} className="object-contain p-2.5" /> : initials(name)}
    </span>
  );
}
