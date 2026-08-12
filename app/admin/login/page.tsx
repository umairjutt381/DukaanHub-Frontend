"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api/client";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/lib/store/auth";

type LoginForm = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const { notify } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({ mode: "onBlur" });

  const submit = async (values: LoginForm) => {
    try {
      const res = await api.post("/auth/login", values);
      if (res.data.user.role !== "admin") {
        notify("Access denied", "Admin credentials are required.");
        return;
      }
      setAuth(res.data.access_token, res.data.user);
      router.push("/admin");
      notify("Admin login successful");
    } catch {
      notify("Access denied", "Invalid admin credentials.");
    }
  };

  return (
    <AuthShell
      eyebrow="Admin portal"
      title="Administrator sign in"
      subtitle="Use an authorized administrator account to access catalog, order and storefront operations."
      footerText="Admin access"
      footerLink={{ href: "/login", label: "Back to customer login" }}
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
        <div>
          <label htmlFor="admin-email" className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Administrator email</label>
          <Input id="admin-email" placeholder="admin@example.com" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} {...register("email", { required: "Enter the administrator email.", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." } })} />
          {errors.email ? <p className="mt-2 text-xs font-medium text-red-700" role="alert">{errors.email.message}</p> : null}
        </div>
        <div>
          <label htmlFor="admin-password" className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Password</label>
          <div className="relative">
            <Input id="admin-password" placeholder="Enter your password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="pr-12" aria-invalid={Boolean(errors.password)} {...register("password", { required: "Enter the administrator password." })} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-[color:var(--muted)] hover:bg-[color:var(--canvas-deep)]" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
          {errors.password ? <p className="mt-2 text-xs font-medium text-red-700" role="alert">{errors.password.message}</p> : null}
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[color:var(--line)] bg-[color:var(--accent-wash)] px-4 py-3 text-sm text-[color:var(--accent-dark)]">
          <ShieldCheck size={16} />
          Admin accounts have full catalog and order access.
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Enter admin panel"}
        </Button>
      </form>
    </AuthShell>
  );
}
