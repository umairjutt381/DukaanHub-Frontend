import { Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const features = [
  { icon: Truck, title: "Nationwide delivery", desc: "Thoughtfully packed and delivered across Pakistan." },
  { icon: ShieldCheck, title: "Protected payments", desc: "Secure checkout and cash on delivery where available." },
  { icon: RotateCcw, title: "Straightforward returns", desc: "Clear policies with no unnecessary fine print." },
  { icon: Headphones, title: "Human support", desc: "Useful help before, during and after your order." },
];

export function FeatureBlock() {
  return (
    <div className="grid overflow-hidden rounded-[var(--radius-lg)] border border-[color:var(--line)] bg-white sm:grid-cols-2 lg:grid-cols-4">
      {features.map((feature, index) => (
        <div key={feature.title} className={`flex gap-3 px-3 py-4 sm:px-4 lg:py-5 ${index ? "sm:border-l sm:border-neutral-100" : ""}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent-wash)] text-[color:var(--accent)]">
            <feature.icon size={16} />
          </span>
          <div>
            <h3 className="text-xs font-bold tracking-[-0.015em] text-neutral-950">{feature.title}</h3>
            <p className="mt-1 text-[0.68rem] leading-4 text-neutral-500">{feature.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
