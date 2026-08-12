"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/store/auth";
import { AuthDivider, GoogleAuthButton } from "@/components/auth/google-auth-button";
import { authHref, getAuthReturnTo, rememberAuthReturnTo } from "@/lib/auth-return";

type LoginForm = {
  email: string;
  password: string;
};

const errorClass = "mt-2 text-xs font-medium text-red-700";

export default function LoginPage() {
  const router = useRouter();
  const { notify } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [returnTo, setReturnTo] = useState("/account");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({ mode: "onBlur" });

  useEffect(() => {
    const destination = getAuthReturnTo();
    setReturnTo(destination);
    rememberAuthReturnTo(destination);
  }, []);

  const submit = async (values: LoginForm) => {
    setSubmitError("");
    try {
      const res = await api.post("/auth/login", values);
      setAuth(res.data.access_token, res.data.user);
      if (res.data.user.role === "admin") {
        router.push("/admin");
        return;
      }
      router.replace(returnTo);
      notify("Welcome back", "You are now signed in.");
    } catch {
      setSubmitError("That email and password combination wasn’t recognized. Please try again.");
      notify("Unable to sign in", "Check your email and password, then try again.");
    }
  };

  return (
    <AuthShell
      eyebrow="Customer account"
      title="Welcome back."
      subtitle="Sign in for a faster checkout and a clear view of every order, address, and update."
      footerText="New to DukaanHub?"
      footerLink={{ href: authHref("/register", returnTo), label: "Create an account" }}
      compact
    >
      <div className="mb-5 space-y-4">
        <GoogleAuthButton label="Continue with Google" returnTo={returnTo} />
        <AuthDivider />
      </div>
      <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
        {submitError ? (
          <div role="alert" className="flex gap-3 rounded-xl bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-800 ring-1 ring-red-100">
            <AlertCircle size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{submitError}</span>
          </div>
        ) : null}

        <div>
          <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Email address</label>
          <div className="relative">
            <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted-light)]" aria-hidden="true" />
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoFocus
              placeholder="you@example.com"
              className="pl-11"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              {...register("email", {
                required: "Enter your email address.",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." }
              })}
            />
          </div>
          {errors.email ? <p id="login-email-error" className={errorClass} role="alert">{errors.email.message}</p> : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-4">
            <label htmlFor="login-password" className="text-sm font-semibold text-[color:var(--ink)]">Password</label>
            <Link href="/forgot-password" className="rounded-md text-xs font-semibold text-[color:var(--ink)] underline decoration-[color:var(--line-dark)] underline-offset-4 transition hover:decoration-[color:var(--ink)]">Forgot password?</Link>
          </div>
          <div className="relative">
            <LockKeyhole size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--muted-light)]" aria-hidden="true" />
            <Input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className="pl-11 pr-12"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              {...register("password", { required: "Enter your password." })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-1.5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[color:var(--muted)] transition hover:bg-white hover:text-[color:var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password ? <p id="login-password-error" className={errorClass} role="alert">{errors.password.message}</p> : null}
        </div>

        <Button type="submit" className="mt-2 w-full rounded-full" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? <><Loader2 size={16} className="mr-2 animate-spin" /> Signing in…</> : "Sign in"}
        </Button>

        <p className="flex items-center justify-center gap-2 text-xs text-[color:var(--muted-light)]">
          <LockKeyhole size={13} aria-hidden="true" /> Your password is sent securely.
        </p>
      </form>
    </AuthShell>
  );
}
