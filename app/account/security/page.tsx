"use client";

import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { AlertCircle, Check, Eye, EyeOff, KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";

import { AccountShell } from "@/components/account/account-shell";
import { useAccountSession, getRequestStatus } from "@/components/account/use-account-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const fieldErrorClass = "mt-2 text-xs font-medium text-red-700";

function PasswordInput({
  id,
  label,
  autoComplete,
  error,
  visible,
  onToggle,
  registration
}: {
  id: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  error?: string;
  visible: boolean;
  onToggle: () => void;
  registration: UseFormRegisterReturn;
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">{label}</label>
      <div className="relative">
        <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted-light)]" aria-hidden="true" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className="pl-11 pr-12"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          {...registration}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-1.5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[color:var(--muted)] transition hover:bg-white hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
        </button>
      </div>
      {error ? <p id={errorId} className={fieldErrorClass} role="alert">{error}</p> : null}
    </div>
  );
}

function getResponseMessage(error: unknown) {
  if (typeof error !== "object" || error === null || !("response" in error)) return undefined;
  const response = (error as { response?: { data?: { detail?: unknown } } }).response;
  return typeof response?.data?.detail === "string" ? response.data.detail : undefined;
}

export default function AccountSecurityPage() {
  const { ready, user, signOut, handleUnauthorized } = useAccountSession();
  const { notify } = useToast();
  const [submitError, setSubmitError] = useState("");
  const [visible, setVisible] = useState<Record<keyof PasswordForm, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<PasswordForm>({ mode: "onBlur" });

  const toggleVisibility = (field: keyof PasswordForm) => {
    setVisible((current) => ({ ...current, [field]: !current[field] }));
  };

  const submit = async (values: PasswordForm) => {
    setSubmitError("");
    try {
      await api.post("/auth/change-password", {
        current_password: values.currentPassword,
        new_password: values.newPassword
      });
      reset();
      setVisible({ currentPassword: false, newPassword: false, confirmPassword: false });
      notify("Password updated", "Use your new password the next time you sign in.");
    } catch (requestError) {
      if (getRequestStatus(requestError) === 401) {
        handleUnauthorized();
        return;
      }
      const message = getResponseMessage(requestError) || "We couldn’t update your password. Please try again.";
      setSubmitError(message);
      notify("Password not changed", message);
    }
  };

  return (
    <AccountShell
      title="Sign-in & security"
      description="Update your password and keep your account protected."
      user={user}
      onSignOut={signOut}
      meta={<span className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--muted)]"><ShieldCheck size={16} className="text-[color:var(--accent)]" /> Protected account</span>}
    >
      {!ready ? (
        <div className="h-80 animate-pulse rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)]" aria-label="Loading security settings" />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
          <section className="rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055] sm:p-7" aria-labelledby="password-heading">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--accent)] text-white"><KeyRound size={18} aria-hidden="true" /></span>
              <div>
                <h2 id="password-heading" className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--ink)]">Change password</h2>
                <p className="mt-1.5 text-sm leading-6 text-[color:var(--muted)]">Enter your current password before choosing a new one.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(submit)} className="mt-7 max-w-xl space-y-5" noValidate>
              {submitError ? (
                <div role="alert" className="flex gap-3 rounded-xl bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-800 ring-1 ring-red-100">
                  <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{submitError}</span>
                </div>
              ) : null}

              <PasswordInput
                id="security-current-password"
                label="Current password"
                autoComplete="current-password"
                error={errors.currentPassword?.message}
                visible={visible.currentPassword}
                onToggle={() => toggleVisibility("currentPassword")}
                registration={register("currentPassword", { required: "Enter your current password." })}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <PasswordInput
                  id="security-new-password"
                  label="New password"
                  autoComplete="new-password"
                  error={errors.newPassword?.message}
                  visible={visible.newPassword}
                  onToggle={() => toggleVisibility("newPassword")}
                  registration={register("newPassword", {
                    required: "Enter a new password.",
                    minLength: { value: 8, message: "Use at least 8 characters." },
                    maxLength: { value: 128, message: "Use no more than 128 characters." },
                    validate: (value) => value !== getValues("currentPassword") || "Choose a password you haven’t just used."
                  })}
                />
                <PasswordInput
                  id="security-confirm-password"
                  label="Confirm new password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  visible={visible.confirmPassword}
                  onToggle={() => toggleVisibility("confirmPassword")}
                  registration={register("confirmPassword", {
                    required: "Confirm your new password.",
                    validate: (value) => value === getValues("newPassword") || "Passwords do not match."
                  })}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-[color:var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-[color:var(--muted)]">At least 8 characters. Avoid passwords used on other websites.</p>
                <Button type="submit" className="shrink-0" disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" aria-hidden="true" /> Updating…</> : "Update password"}
                </Button>
              </div>
            </form>
          </section>

          <aside className="rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] p-5 sm:p-6" aria-label="Password guidance">
            <ShieldCheck size={22} className="text-[color:var(--accent)]" aria-hidden="true" />
            <h2 className="mt-5 text-base font-semibold text-[color:var(--ink)]">A stronger password</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-[color:var(--muted)]">
              {["Uses a mix of words or characters", "Is unique to your DukaanHub account", "Doesn’t include obvious personal details"].map((item) => (
                <li key={item} className="flex gap-2.5"><Check size={15} className="mt-1 shrink-0 text-[color:var(--accent)]" aria-hidden="true" /><span>{item}</span></li>
              ))}
            </ul>
          </aside>
        </div>
      )}
    </AccountShell>
  );
}
