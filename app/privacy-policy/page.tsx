import { EditorialPage } from "@/components/layout/editorial-page";

export default function PrivacyPolicyPage() {
  return (
    <EditorialPage eyebrow="Privacy policy" title="How DukaanHub uses your information" description="The information required to provide accounts, orders, delivery and customer support.">
      <div className="space-y-6 text-sm leading-7 text-[color:var(--muted)]">
        <section><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">What we collect</h2><p className="mt-2">Account, contact, delivery, and order information is used to make purchases, deliveries, and support requests possible.</p></section>
        <section><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">How it is used</h2><p className="mt-2">Your information supports checkout, fulfillment, notifications, and customer service. It is not displayed publicly through the storefront.</p></section>
        <section><h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">Your account</h2><p className="mt-2">You can manage your account details, saved addresses, and order history from your customer account area.</p></section>
      </div>
    </EditorialPage>
  );
}
