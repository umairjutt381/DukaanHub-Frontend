"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { AuthShell } from "@/components/auth/auth-shell";
import { api } from "@/lib/api/client";

type FormValues = { password: string; confirmPassword: string };

export default function ResetPasswordPage() {
  const token = useSearchParams().get("token") || "";
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<FormValues>();
  async function submit(values: FormValues) {
    setError("");
    try { await api.post("/auth/reset-password", { token, new_password: values.password }); setSuccess(true); } catch (requestError: any) { setError(requestError?.response?.data?.detail || "This reset link is invalid or expired."); }
  }
  return <AuthShell eyebrow="Account security" title="Choose a new password." subtitle="Use a strong password you do not use on another website." compact>
    {success ? <div className="rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] p-6"><LockKeyhole size={22} className="text-[color:var(--accent)]" /><h2 className="mt-4 text-lg font-semibold text-[color:var(--ink)]">Password updated</h2><p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">Your password has been reset successfully.</p><Link href="/login" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white">Sign in</Link></div> : !token ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">This reset link is missing its token. Request a new one.</p> : <form onSubmit={handleSubmit(submit)} className="space-y-5"><div><label htmlFor="reset-password" className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">New password</label><input id="reset-password" type="password" autoComplete="new-password" className="h-12 w-full rounded-xl border border-[color:var(--line)] px-4 text-sm outline-none focus:border-[color:var(--accent)]" {...register("password", { required: "Enter a new password.", minLength: { value: 8, message: "Use at least 8 characters." } })} />{errors.password ? <p className="mt-2 text-xs text-red-700">{errors.password.message}</p> : null}</div><div><label htmlFor="reset-confirm" className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Confirm password</label><input id="reset-confirm" type="password" autoComplete="new-password" className="h-12 w-full rounded-xl border border-[color:var(--line)] px-4 text-sm outline-none focus:border-[color:var(--accent)]" {...register("confirmPassword", { required: "Confirm your password.", validate: value => value === getValues("password") || "Passwords do not match." })} />{errors.confirmPassword ? <p className="mt-2 text-xs text-red-700">{errors.confirmPassword.message}</p> : null}</div>{error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}<button disabled={isSubmitting} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-5 text-sm font-semibold text-white disabled:opacity-60">{isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Updating…</> : "Reset password"}</button></form>}
    <Link href="/login" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[color:var(--ink)]"><ArrowLeft size={16} /> Back to sign in</Link>
  </AuthShell>;
}
