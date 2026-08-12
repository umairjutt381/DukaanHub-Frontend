import { ReactNode } from "react";

import Link from "next/link";
import { PageIntro } from "./page-intro";

type EditorialPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  aside?: ReactNode;
};

export function EditorialPage({ eyebrow, title, description, children, aside }: EditorialPageProps) {
  return (
    <section className="container-page py-8 md:py-12">
      <nav className="text-xs font-semibold text-[color:var(--muted)]"><Link href="/">Home</Link> <span className="px-2">/</span> {eyebrow}</nav>
      <PageIntro eyebrow={eyebrow} title={title} description={description} />
      <div className={`mt-8 grid gap-6 ${aside ? "lg:grid-cols-[minmax(0,1fr)_21rem]" : "max-w-4xl"}`}>
        <article className="rounded-2xl border border-[color:var(--line)] bg-white p-6 sm:p-8 lg:p-10">{children}</article>
        {aside ? <aside className="h-fit rounded-2xl bg-[color:var(--ink)] p-6 text-white lg:sticky lg:top-[var(--sticky-shell-offset)] lg:transition-[top] lg:duration-300">{aside}</aside> : null}
      </div>
    </section>
  );
}
