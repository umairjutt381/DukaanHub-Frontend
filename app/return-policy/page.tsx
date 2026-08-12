import { EditorialPage } from "@/components/layout/editorial-page";

export default function ReturnPolicyPage() {
  return (
    <EditorialPage eyebrow="Return policy" title="Returns and refunds" description="How to request a return and what information the support team will need.">
      <div className="space-y-6 text-sm leading-7 text-[color:var(--muted)]">
        <p>Keep your order details and contact the DukaanHub team with the product and reason for your request. We will guide you through the next steps.</p>
        <div className="rounded-2xl bg-[color:var(--canvas)] p-5"><p className="font-semibold text-[color:var(--ink)]">Before you request a return</p><ul className="mt-3 list-disc space-y-2 pl-5"><li>Keep the item in its original condition where possible.</li><li>Have your order number ready.</li><li>Share clear details so the team can help quickly.</li></ul></div>
      </div>
    </EditorialPage>
  );
}
