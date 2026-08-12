import { FaqExperience } from "@/components/commerce/faq-experience";
import { CommerceBreadcrumb } from "@/components/commerce/commerce-primitives";

export default function FaqsPage() {
  return (
    <div className="pb-20 md:pb-28">
      <section className="container-page pt-6 sm:pt-8" aria-labelledby="faq-title">
        <CommerceBreadcrumb current="Frequently asked questions" />
        <div className="mt-5 rounded-[30px] bg-[color:var(--canvas-deep)] px-6 pb-20 pt-12 text-center sm:px-10 sm:pb-24 sm:pt-16">
          <p className="eyebrow">Customer support</p>
          <h1 id="faq-title" className="mx-auto mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-[color:var(--ink)] sm:text-6xl lg:text-7xl">Answers, without the maze.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">Search straightforward guidance for orders, payments, delivery, returns and your account.</p>
        </div>
        <FaqExperience />
      </section>
    </div>
  );
}
