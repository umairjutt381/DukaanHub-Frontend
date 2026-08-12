import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({ title, link, description, eyebrow }: { title: string; link?: string; description?: string; eyebrow?: string }) {
  return (
    <div className="mb-4 flex flex-col justify-between gap-3 sm:mb-5 sm:flex-row sm:items-end">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-[0.62rem] font-bold uppercase tracking-[0.16em] text-[color:var(--accent-dark)]">{eyebrow}</p> : null}
        <h2 className={`${eyebrow ? "mt-1" : ""} text-xl font-bold tracking-[-0.04em] text-neutral-950 sm:text-2xl`}>{title}</h2>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:text-base">{description}</p> : null}
      </div>
      {link ? (
        <Link href={link} className="group inline-flex min-h-8 shrink-0 items-center gap-1.5 self-start rounded-md border border-[color:var(--line-dark)] bg-white px-3 text-xs font-bold text-neutral-700 transition hover:border-[color:var(--accent)] hover:text-[color:var(--accent-dark)] sm:self-auto">
          View all <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
        </Link>
      ) : null}
    </div>
  );
}
