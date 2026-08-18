"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/store/auth";
import { cn } from "@/lib/utils";
import { AuthDivider, GoogleAuthButton } from "@/components/auth/google-auth-button";
import { authHref, getAuthReturnTo, rememberAuthReturnTo } from "@/lib/auth-return";

type RegisterForm = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
};

const fieldLabelClass = "mb-2 block text-sm font-semibold text-[color:var(--ink)]";
const errorClass = "mt-2 text-xs font-medium text-red-700";

export default function RegisterPage() {
  const router = useRouter();
  const { notify } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPasswords, setShowPasswords] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [returnTo, setReturnTo] = useState("/");
  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({ mode: "onBlur", defaultValues: { phone: "" } });

  const password = watch("password") || "";
  const passwordStrength = [
    password.length >= 8,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d/.test(password) || /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;

  useEffect(() => {
    const destination = getAuthReturnTo();
    setReturnTo(destination);
    rememberAuthReturnTo(destination);
  }, []);

  const submit = async (values: RegisterForm) => {
    setSubmitError("");
    try {
      const res = await api.post("/auth/register", {
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        password: values.password
      });
      setAuth(res.data.access_token, res.data.user);
      router.replace(returnTo);
      notify("Account created", "Welcome to DukaanHub.");
    } catch {
      setSubmitError("We couldn’t create your account with those details. The email may already be registered.");
      notify("Unable to create account", "Review your details and try again.");
    }
  };

  return (
    <AuthShell
      eyebrow="Join DukaanHub"
      title="Create your account."
      subtitle="Save your details once for a smoother checkout and effortless order tracking."
      footerText="Already have an account?"
      footerLink={{ href: authHref("/login", returnTo), label: "Sign in" }}
    >
      <div className="mb-5 space-y-4">
        <GoogleAuthButton label="Sign up with Google" returnTo="/" />
        <AuthDivider />
      </div>
      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
        {submitError ? (
          <div role="alert" className="flex gap-3 rounded-xl bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-800 ring-1 ring-red-100">
            <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        ) : null}

        <div>
          <label htmlFor="register-name" className={fieldLabelClass}>Full name</label>
          <div className="relative">
            <UserRound size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted-light)]" aria-hidden="true" />
            <Input
              id="register-name"
              autoComplete="name"
              autoFocus
              placeholder="Your full name"
              className="pl-11"
              aria-invalid={Boolean(errors.full_name)}
              aria-describedby={errors.full_name ? "register-name-error" : undefined}
              {...register("full_name", { required: "Enter your full name." })}
            />
          </div>
          {errors.full_name ? <p id="register-name-error" className={errorClass} role="alert">{errors.full_name.message}</p> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-email" className={fieldLabelClass}>Email address</label>
            <div className="relative">
              <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted-light)]" aria-hidden="true" />
              <Input
                id="register-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
                className="pl-11"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "register-email-error" : undefined}
                {...register("email", {
                  required: "Enter your email address.",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." }
                })}
              />
            </div>
            {errors.email ? <p id="register-email-error" className={errorClass} role="alert">{errors.email.message}</p> : null}
          </div>
          <div>
            <label htmlFor="register-phone" className={fieldLabelClass}>Phone <span className="font-normal text-[color:var(--muted)]">(optional)</span></label>
            <div className="relative">
              <Phone size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted-light)]" aria-hidden="true" />
              <Input id="register-phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="03XX XXXXXXX" className="pl-11" {...register("phone")} />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-password" className={fieldLabelClass}>Password</label>
            <div className="relative">
              <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted-light)]" aria-hidden="true" />
              <Input
                id="register-password"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="pl-11 pr-12"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "register-password-error" : "password-strength"}
                {...register("password", {
                  required: "Create a password.",
                  minLength: { value: 8, message: "Use at least 8 characters." }
                })}
              />
              <button
                type="button"
                onClick={() => setShowPasswords((visible) => !visible)}
                className="absolute right-1.5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[color:var(--muted)] transition hover:bg-white hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
                aria-pressed={showPasswords}
              >
                {showPasswords ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password ? <p id="register-password-error" className={errorClass} role="alert">{errors.password.message}</p> : (
              <div id="password-strength" className="mt-2 flex items-center gap-2" aria-label={`Password strength ${passwordStrength} of 3`}>
                <div className="grid flex-1 grid-cols-3 gap-1">
                  {[1, 2, 3].map((step) => <span key={step} className={cn("h-1 rounded-full transition-colors", passwordStrength >= step ? "bg-[color:var(--accent)]" : "bg-[color:var(--line)]")} />)}
                </div>
                <span className="text-[0.65rem] text-[color:var(--muted)]">8+ characters</span>
              </div>
            )}
          </div>
          <div>
            <label htmlFor="register-confirm-password" className={fieldLabelClass}>Confirm password</label>
            <Input
              id="register-confirm-password"
              type={showPasswords ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat password"
              aria-invalid={Boolean(errors.confirm_password)}
              aria-describedby={errors.confirm_password ? "register-confirm-error" : undefined}
              {...register("confirm_password", {
                required: "Confirm your password.",
                validate: (value) => value === getValues("password") || "Passwords do not match."
              })}
            />
            {errors.confirm_password ? <p id="register-confirm-error" className={errorClass} role="alert">{errors.confirm_password.message}</p> : null}
          </div>
        </div>

        <p className="pt-1 text-xs leading-5 text-[color:var(--muted)]">
          By creating an account, you agree to our <Link href="/terms-conditions" className="font-semibold text-[color:var(--ink)] underline decoration-[color:var(--line-dark)] underline-offset-4">terms</Link> and acknowledge our <Link href="/privacy-policy" className="font-semibold text-[color:var(--ink)] underline decoration-[color:var(--line-dark)] underline-offset-4">privacy policy</Link>.
        </p>
        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Creating account…</> : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
