"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthShell } from "@/components/auth/auth-shell";
import { api } from "@/lib/api/client";

type FormValues = { email: string };

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>();

  async function submit(values: FormValues) {
    setError("");
    try {
      await api.post("/auth/forgot-password", values);
      setSent(true);
    } catch {
      setError("We couldn’t process that request. Please try again.");
    }
  }

  return <AuthShell eyebrow="Account recovery" title="Let’s get you back in." subtitle="Enter the email used for your DukaanHub account and we’ll send a secure password reset link." compact>
    {sent ? <div className="rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] p-5 ring-1 ring-black/[0.045] sm:p-6"><MailCheck size={22} className="text-[color:var(--accent)]" /><h2 className="mt-4 text-lg font-semibold text-[color:var(--ink)]">Check your inbox</h2><p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">If an account exists for that email, a reset link is on its way. The link expires in 30 minutes.</p><Link href="/login" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white">Back to sign in</Link></div> : <form onSubmit={handleSubmit(submit)} className="space-y-5"><div><label htmlFor="forgot-email" className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Email address</label><input id="forgot-email" type="email" autoComplete="email" placeholder="you@example.com" className="h-12 w-full rounded-xl border border-[color:var(--line)] bg-white px-4 text-sm outline-none focus:border-[color:var(--accent)]" aria-invalid={Boolean(errors.email)} {...register("email", { required: "Enter your email address." })} />{errors.email ? <p className="mt-2 text-xs text-red-700">{errors.email.message}</p> : null}</div>{error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}<button disabled={isSubmitting} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Sending…</> : "Send reset link"}</button><p className="flex items-center gap-2 text-xs text-[color:var(--muted)]"><ShieldCheck size={15} className="text-[color:var(--accent)]" /> We never reveal whether an email is registered.</p></form>}
    <Link href="/login" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[color:var(--ink)]"><ArrowLeft size={16} /> Back to sign in</Link>
  </AuthShell>;
}
