import { EditorialPage } from "@/components/layout/editorial-page";

export default function TermsPage() {
  return (
    <EditorialPage eyebrow="Legal" title="Terms and conditions" description="The terms that apply to accounts and orders placed through DukaanHub.">
      <div className="space-y-6 text-sm leading-7 text-[color:var(--muted)]">
        <section><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">Orders</h2><p className="mt-2">Order availability, pricing, and payment status are confirmed through the checkout process. Please review your order details before you place it.</p></section>
        <section><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">Accounts</h2><p className="mt-2">Keep your sign-in details private and make sure your contact and delivery information is accurate.</p></section>
        <section><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">Support</h2><p className="mt-2">If something needs attention, contact the DukaanHub team with your order number and relevant details.</p></section>
      </div>
    </EditorialPage>
  );
}
