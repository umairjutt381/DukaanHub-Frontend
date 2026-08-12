"use client";

import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";

type AuthShellProps = {
  title: string;
  subtitle: string;
  eyebrow: string;
  children: React.ReactNode;
  footerLink?: { href: string; label: string };
  footerText?: string;
  compact?: boolean;
};

export function AuthShell({
  title,
  subtitle,
  eyebrow,
  children,
  footerLink,
  footerText,
  compact = false
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[#f7f9fc]">
      <header className="border-b border-[#e7e9f0] bg-white">
        <div className="mx-auto flex h-[76px] w-full max-w-[1180px] items-center justify-between px-5 sm:px-8">
          <Link href="/" className="inline-flex rounded-xl" aria-label="DukaanHub home">
            <BrandLogo />
          </Link>
          <Link href="/" className="inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-[#5d6478] transition hover:bg-[#f1f2f6] hover:text-[#212844] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#212844]">
            <ArrowLeft size={16} aria-hidden="true" /> Back to store
          </Link>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[760px] flex-col px-5 py-10 sm:px-8 sm:py-14">
        <div className={`mx-auto w-full rounded-[20px] border border-[#e7e9f0] bg-white p-6 shadow-[0_8px_28px_rgba(18,27,59,0.06)] sm:p-9 ${compact ? "max-w-[500px]" : "max-w-[620px]"}`}>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.15em] text-[#212844]">{eyebrow}</p>
          <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-[#16192c]">{title}</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#6e7488]">{subtitle}</p>

          <div className="mt-7">{children}</div>

          {footerLink && footerText ? (
            <p className="mt-7 border-t border-[#e7e9f0] pt-5 text-sm text-[#6e7488]">
              {footerText}{" "}
              <Link href={footerLink.href} className="font-semibold text-[#212844] transition hover:text-[#171c31]">
                {footerLink.label}
              </Link>
            </p>
          ) : null}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[#8b91a3]"><LockKeyhole size={13} /> Protected by secure, encrypted account access.</p>
      </section>
    </main>
  );
}
