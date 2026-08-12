"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowRight, Check, CircleAlert, CircleHelp, Headphones, PackageSearch, RotateCcw, Send, ShieldCheck } from "lucide-react";

import { CommerceBreadcrumb } from "@/components/commerce/commerce-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { api } from "@/lib/api/client";

type ContactForm = { name: string; email: string; subject: string; message: string };

const supportLinks = [
  { title: "Track an order", copy: "See the latest milestone with your order number.", href: "/track-order", icon: PackageSearch, action: "Track now" },
  { title: "Returns and refunds", copy: "Understand eligibility and how to begin a request.", href: "/return-policy", icon: RotateCcw, action: "View policy" },
  { title: "Common questions", copy: "Quick answers for delivery, payment and accounts.", href: "/faqs", icon: CircleHelp, action: "Browse answers" }
];

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? <p id={id} className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[color:var(--danger)]"><CircleAlert size={13} />{message}</p> : null;
}

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactForm>();
  const { notify } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (values: ContactForm) => {
    setSubmitted(false);
    try {
      await api.post("/contact", values);
      reset();
      setSubmitted(true);
      notify("Message sent", "Customer care has received your message.");
    } catch (error: any) {
      notify("Message not sent", error?.response?.data?.detail || "Please check your details and try again.");
    }
  };

  return (
    <div className="pb-20 md:pb-28">
      <section className="container-page pt-6 sm:pt-8" aria-labelledby="contact-title">
        <CommerceBreadcrumb current="Customer care" />

        <div className="mt-5 grid gap-10 rounded-[30px] bg-[color:var(--canvas-deep)] px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-end lg:px-14 lg:py-16">
          <div>
            <p className="eyebrow">Customer care</p>
            <h1 id="contact-title" className="mt-4 max-w-3xl text-5xl font-semibold tracking-[-0.06em] text-[color:var(--ink)] sm:text-6xl lg:text-7xl">Help starts with the right route.</h1>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">Track a delivery, find a policy, or tell us exactly what you need. We’ll help you move forward without the runaround.</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.04] sm:p-6">
            <div className="flex items-start gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]"><PackageSearch size={18} /></span><div><h2 className="text-sm font-semibold text-[color:var(--ink)]">Looking for an order?</h2><p className="mt-1 text-xs leading-5 text-[color:var(--muted)]">Your order number gives you the fastest path to its live status.</p></div></div>
            <Link href="/track-order" className="group mt-5 inline-flex min-h-11 w-full items-center justify-between rounded-xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Track an order <ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {supportLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group flex min-h-44 flex-col rounded-[20px] bg-white p-5 ring-1 ring-black/[0.055] transition duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow)] sm:p-6">
              <span className="grid size-10 place-items-center rounded-xl bg-[color:var(--canvas-deep)] text-[color:var(--ink)] transition group-hover:bg-[color:var(--accent-wash)] group-hover:text-[color:var(--accent-dark)]"><item.icon size={18} /></span>
              <h2 className="mt-5 text-base font-semibold tracking-[-0.015em] text-[color:var(--ink)]">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.copy}</p>
              <span className="mt-auto inline-flex items-center pt-5 text-xs font-semibold text-[color:var(--accent-dark)]">{item.action} <ArrowRight size={13} className="ml-1.5 transition group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.72fr_1.28fr] xl:grid-cols-[380px_minmax(0,1fr)] xl:gap-16">
          <aside className="h-fit lg:sticky lg:top-[var(--sticky-shell-offset)] lg:transition-[top] lg:duration-300">
            <p className="eyebrow">Still need help?</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-[color:var(--ink)] sm:text-4xl">Tell us what happened.</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">Share enough context for customer care to understand the question the first time. For order issues, include the reference beginning with DH-.</p>
            <div className="mt-7 space-y-4 border-t border-[color:var(--line)] pt-6">
              <p className="flex items-start gap-3 text-sm leading-6 text-[color:var(--muted)]"><Headphones size={17} className="mt-1 shrink-0 text-[color:var(--accent)]" /><span><strong className="block font-semibold text-[color:var(--ink)]">A real support path</strong>Use this form for questions that need more context.</span></p>
              <p className="flex items-start gap-3 text-sm leading-6 text-[color:var(--muted)]"><ShieldCheck size={17} className="mt-1 shrink-0 text-[color:var(--accent)]" /><span><strong className="block font-semibold text-[color:var(--ink)]">Keep sensitive details private</strong>Never include a password or full payment credentials.</span></p>
            </div>
          </aside>

          <div className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055] sm:p-8 lg:p-10">
            <div className="border-b border-[color:var(--line)] pb-6">
              <p className="eyebrow">Send a message</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">What can we help with?</h2>
              <p className="mt-2 text-sm text-[color:var(--muted)]">Every field marked as required helps route the message correctly.</p>
            </div>

            {submitted ? (
              <div role="status" className="mt-6 flex items-start gap-3 rounded-2xl bg-[color:var(--accent-wash)] p-4 text-sm text-[color:var(--accent-dark)]">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[color:var(--accent)] text-white"><Check size={15} /></span>
                <div><p className="font-semibold">Your message is with customer care.</p><p className="mt-1 leading-6">We received the details you provided.</p></div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-7 grid gap-5 sm:grid-cols-2" noValidate>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Name</span>
                <Input autoComplete="name" placeholder="Your full name" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "contact-name-error" : undefined} {...register("name", { required: "Enter your name." })} />
                <FieldError id="contact-name-error" message={errors.name?.message} />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Email address</span>
                <Input type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "contact-email-error" : undefined} {...register("email", { required: "Enter your email address.", pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." } })} />
                <FieldError id="contact-email-error" message={errors.email?.message} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Topic</span>
                <Select aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? "contact-subject-error" : undefined} {...register("subject", { required: "Choose a topic." })}>
                  <option value="">Choose a topic</option>
                  <option value="Order status">Order status</option>
                  <option value="Product question">Product question</option>
                  <option value="Delivery question">Delivery question</option>
                  <option value="Return or refund">Return or refund</option>
                  <option value="Account support">Account support</option>
                  <option value="Other question">Other question</option>
                </Select>
                <FieldError id="contact-subject-error" message={errors.subject?.message} />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Message</span>
                <Textarea className="min-h-44" placeholder="Tell us what happened, what you expected, and any order number involved." aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? "contact-message-error" : undefined} {...register("message", { required: "Enter your message.", minLength: { value: 10, message: "Add a little more detail so we can help." } })} />
                <FieldError id="contact-message-error" message={errors.message?.message} />
              </label>
              <div className="sm:col-span-2">
                <Button type="submit" disabled={isSubmitting} className="min-h-12 w-full sm:w-auto">{isSubmitting ? "Sending your message…" : "Send message"}<Send size={15} className="ml-2" /></Button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
