import Link from "next/link";
import { ArrowLeft, ArrowRight, LifeBuoy, MailCheck, ShieldCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Let’s get you back in."
      subtitle="Online password recovery isn’t enabled for this store yet. Our support team can verify your account and help restore access securely."
      compact
    >
      <div className="overflow-hidden rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] ring-1 ring-black/[0.045]">
        <div className="p-5 sm:p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[color:var(--ink)] shadow-[var(--shadow-xs)]">
            <LifeBuoy size={19} aria-hidden="true" />
          </span>
          <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[color:var(--ink)]">Contact customer support</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
            Contact us from the email address connected to your account. This helps the team verify you more quickly.
          </p>
          <Link href="/contact" className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">
            Contact support <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid gap-3 border-t border-[color:var(--line)] bg-white px-5 py-4 text-xs text-[color:var(--muted)] sm:grid-cols-2 sm:px-6">
          <span className="flex items-center gap-2"><MailCheck size={15} className="text-[color:var(--accent)]" /> Use your account email</span>
          <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[color:var(--accent)]" /> Never share your password</span>
        </div>
      </div>

      <Link href="/login" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-[color:var(--ink)] transition hover:text-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]">
        <ArrowLeft size={16} aria-hidden="true" /> Back to sign in
      </Link>
    </AuthShell>
  );
}
