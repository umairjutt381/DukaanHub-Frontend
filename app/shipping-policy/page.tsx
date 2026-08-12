import { EditorialPage } from "@/components/layout/editorial-page";

export default function ShippingPolicyPage() {
  return (
    <EditorialPage eyebrow="Shipping policy" title="Shipping and delivery" description="Delivery details, charges and order tracking information for DukaanHub purchases.">
      <div className="space-y-6 text-sm leading-7 text-[color:var(--muted)]">
        <section><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">Delivery details</h2><p className="mt-2">Provide a complete shipping address and phone number at checkout. This helps our team process your order and keeps delivery updates accurate.</p></section>
        <section><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">Shipping charges</h2><p className="mt-2">Applicable delivery charges are shown in your cart and checkout summary before you confirm payment.</p></section>
        <section><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">Tracking</h2><p className="mt-2">After placing an order, use your order number on the tracking page to see the current status.</p></section>
      </div>
    </EditorialPage>
  );
}
