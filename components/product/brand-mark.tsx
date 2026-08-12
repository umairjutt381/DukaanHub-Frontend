import { cn } from "@/lib/utils";

const tones = [
  "bg-[#eef6f0] text-[#176b35]",
  "bg-[#f0f1f7] text-[#3d466f]",
  "bg-[#f7f1eb] text-[#765333]",
  "bg-[#f5eef4] text-[#704166]",
  "bg-[#eef4f6] text-[#285e70]"
];

function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "DH";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function BrandMark({ name, className }: { name?: string | null; className?: string }) {
  const brandName = name?.trim() || "DukaanHub";
  const tone = tones[Array.from(brandName).reduce((total, character) => total + character.charCodeAt(0), 0) % tones.length];

  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-bold tracking-[-0.02em]", tone, className)}
    >
      {initials(brandName)}
    </span>
  );
}
