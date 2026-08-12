"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="container-page flex min-h-[60vh] items-center justify-center py-12">
      <div className="max-w-lg text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-700"><AlertCircle size={24} /></span>
        <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] text-[color:var(--ink)]">Something went wrong</h1>
        <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">We could not load this page. Please try again.</p>
        <Button onClick={reset} className="mt-6">Try again</Button>
      </div>
    </section>
  );
}
