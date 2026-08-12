import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKeyhole, ShieldAlert, ShieldCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Account security"
      title="Reset with confidence."
      subtitle="Password reset links aren’t enabled for this store yet. Support can help verify your account through the secure recovery process."
      compact
    >
      <div className="rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] p-5 ring-1 ring-black/[0.045] sm:p-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[color:var(--ink)] shadow-[var(--shadow-xs)]">
          <LockKeyhole size={19} aria-hidden="true" />
        </span>
        <h2 className="mt-5 text-lg font-semibold tracking-[-0.02em] text-[color:var(--ink)]">Protecting your account</h2>
        <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
          DukaanHub support will never ask for your existing password, payment PIN, or one-time code.
        </p>

        <div className="mt-5 space-y-2.5 border-t border-[color:var(--line)] pt-5 text-xs text-[color:var(--muted)]">
          <p className="flex items-center gap-2"><ShieldCheck size={15} className="text-[color:var(--accent)]" /> Verify through official support only</p>
          <p className="flex items-center gap-2"><ShieldAlert size={15} className="text-[color:var(--accent)]" /> Keep all verification details private</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/contact" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">
            Contact support <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <Link href="/login" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[color:var(--ink)] shadow-[var(--shadow-xs)] ring-1 ring-black/[0.07] transition hover:bg-[#fafbfa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]">
            <ArrowLeft size={16} aria-hidden="true" /> Try signing in
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
