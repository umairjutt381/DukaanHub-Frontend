"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Banknote, Check, CircleAlert, CreditCard, MapPin, MessageSquareText, Package, ShieldCheck, Smartphone, Tag, Truck } from "lucide-react";

import { CheckoutProgress, CommerceBreadcrumb, CommerceEmptyState, SecureLabel } from "@/components/commerce/commerce-primitives";
import { AssetImage } from "@/components/ui/asset-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { api, getProductsByIds } from "@/lib/api/client";
import { useCartStore } from "@/lib/store/cart";
import type { Product } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type FormValues = {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  billing_address?: string;
  notes?: string;
  payment_method: string;
  coupon_code?: string;
};

type CheckoutLine = {
  id: number;
  product_id: number;
  quantity: number;
  product?: { id: number; name: string; slug?: string; sku?: string; price: number } | null;
};

const paymentMethods = [
  { value: "cash_on_delivery", label: "Cash on delivery", copy: "Pay the courier when your order arrives.", icon: Banknote, available: true },
  { value: "jazzcash", label: "JazzCash", copy: "Available when the JazzCash gateway is configured.", icon: Smartphone, available: process.env.NEXT_PUBLIC_ENABLE_JAZZCASH === "true" },
  { value: "easypaisa", label: "Easypaisa", copy: "Available when the Easypaisa gateway is configured.", icon: Smartphone, available: process.env.NEXT_PUBLIC_ENABLE_EASYPAISA === "true" },
  { value: "stripe", label: "Debit or credit card", copy: "Pay securely with Stripe.", icon: CreditCard, available: process.env.NEXT_PUBLIC_ENABLE_STRIPE_PAYMENTS === "true" }
];

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[color:var(--danger)]"><CircleAlert size={13} />{message}</p> : null;
}

function primaryImage(product?: Product) {
  return product?.images?.find((image) => image.is_primary)?.url || product?.images?.[0]?.url;
}

function CheckoutSkeleton() {
  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-16">
      <div className="space-y-6"><Skeleton className="h-[390px] rounded-[24px]" /><Skeleton className="h-72 rounded-[24px]" /></div>
      <Skeleton className="h-[540px] rounded-[24px]" />
    </div>
  );
}

function continueToHostedPayment(url: string, fields?: Record<string, unknown> | null) {
  if (!fields || !Object.keys(fields).length) {
    window.location.assign(url);
    return;
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = url;
  form.hidden = true;
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = typeof value === "string" ? value : String(value ?? "");
    form.appendChild(input);
  });
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const router = useRouter();
  const { notify } = useToast();
  const localItems = useCartStore((state) => state.items);
  const clearLocalCart = useCartStore((state) => state.clear);
  const idempotencyKeyRef = useRef<string | null>(null);
  const [cart, setCart] = useState<any>(null);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({ defaultValues: { payment_method: "cash_on_delivery" } });
  const selectedPayment = watch("payment_method");

  useEffect(() => {
    let active = true;
    const hasToken = typeof window !== "undefined" && Boolean(window.localStorage.getItem("dukaanhub_token"));
    setSignedIn(hasToken);
    setCheckingSession(false);

    if (!hasToken) {
      notify("Sign in required", "Sign in to continue to secure checkout.");
      router.replace("/login?returnTo=%2Fcheckout");
      return () => {
        active = false;
      };
    }

    const loadCheckout = async () => {
      try {
        const cartResponse = await api.get("/cart");
        let nextCart = cartResponse.data;
        const remoteProductIds = new Set<number>((nextCart.items || []).map((item: CheckoutLine) => item.product_id));
        const missingLocalItems = localItems.filter((item) => !remoteProductIds.has(item.product_id));

        if (missingLocalItems.length) {
          await Promise.all(missingLocalItems.map((item) => api.post("/cart/items", { product_id: item.product_id, quantity: item.quantity })));
          nextCart = (await api.get("/cart")).data;
        }

        const products = await getProductsByIds((nextCart.items || []).map((item: CheckoutLine) => item.product_id));
        if (!active) return;
        setCart(nextCart);
        setCatalog(products);
        setLoadError("");
      } catch (error: any) {
        if (!active) return;
        setLoadError(error?.response?.data?.detail || "We could not load your cart. Please return to your bag and try again.");
      } finally {
        if (active) setLoadingCart(false);
      }
    };

    loadCheckout();
    return () => {
      active = false;
    };
  }, [localItems, notify, router]);

  const lines = useMemo<CheckoutLine[]>(() => cart?.items || [], [cart]);
  const subtotal = cart?.subtotal ?? 0;
  const tax = cart?.tax ?? 0;
  const shipping = lines.length ? (cart?.shipping ?? 0) : 0;
  const total = lines.length ? (cart?.total ?? subtotal + tax + shipping) : 0;

  const onSubmit = async (values: FormValues) => {
    setSubmitError("");
    try {
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }
      const response = await api.post("/orders/checkout", { ...values, idempotency_key: idempotencyKeyRef.current });
      clearLocalCart();
      window.dispatchEvent(new Event("dukaanhub:cart-changed"));
      const orderNumber = response.data?.order_number;
      const redirectUrl = response.data?.redirect_url;
      if (redirectUrl) {
        notify("Order created", "Continue to the secure payment page to complete your order.");
        continueToHostedPayment(redirectUrl, response.data?.redirect_form);
        return;
      }
      notify("Order placed", values.payment_method === "cash_on_delivery" ? "Your cash-on-delivery order is confirmed." : "Your order has been created.");
      router.push(orderNumber ? `/order-success?order=${encodeURIComponent(orderNumber)}` : "/order-success");
    } catch (error: any) {
      const detail = error?.response?.data?.detail || "We could not place your order. Review your details and try again.";
      setSubmitError(detail);
      notify("Order not placed", detail);
    }
  };

  if (checkingSession || !signedIn) {
    return (
      <section className="container-page py-16 md:py-24" aria-label="Preparing checkout">
        <div className="mx-auto flex max-w-md flex-col items-center text-center" role="status">
          <span className="grid size-12 place-items-center rounded-2xl bg-[color:var(--canvas-deep)] text-[color:var(--accent)]"><ShieldCheck size={21} /></span>
          <p className="mt-5 text-sm font-medium text-[color:var(--ink)]">Preparing secure checkout</p>
          <p className="mt-2 text-xs text-[color:var(--muted)]">Verifying your session and order details…</p>
        </div>
      </section>
    );
  }

  return (
    <div className="pb-20 md:pb-28">
      <section className="container-page pt-6 sm:pt-8">
        <CommerceBreadcrumb current="Checkout" />
        <div className="mt-5 grid gap-8 border-b border-[color:var(--line)] pb-8 md:grid-cols-[minmax(0,1fr)_420px] md:items-end md:pb-10">
          <div>
            <Link href="/cart" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[color:var(--muted)] transition hover:text-[color:var(--ink)]"><ArrowLeft size={15} /> Back to bag</Link>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <h1 className="text-5xl font-semibold tracking-[-0.06em] text-[color:var(--ink)] sm:text-6xl">Checkout</h1>
              <SecureLabel />
            </div>
            <p className="mt-4 text-sm leading-6 text-[color:var(--muted)]">One final check. Add your delivery details and choose how you would like to pay.</p>
          </div>
          <div className="md:justify-self-end"><CheckoutProgress current={2} /></div>
        </div>

        {loadingCart ? <CheckoutSkeleton /> : loadError ? (
          <CommerceEmptyState icon={CircleAlert} eyebrow="Checkout unavailable" title="We could not load your bag." description={loadError}>
            <Link href="/cart" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Return to bag</Link>
          </CommerceEmptyState>
        ) : !lines.length ? (
          <CommerceEmptyState icon={Package} eyebrow="Nothing to checkout" title="Your bag is empty." description="Choose at least one product before continuing to delivery and payment.">
            <Link href="/products" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)]">Explore products</Link>
          </CommerceEmptyState>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_400px] xl:gap-16" noValidate>
            <div className="space-y-8">
              <section aria-labelledby="delivery-heading" className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055] sm:p-8">
                <div className="flex items-start gap-4 border-b border-[color:var(--line)] pb-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]"><MapPin size={18} /></span>
                  <div><p className="eyebrow">Step 1</p><h2 id="delivery-heading" className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[color:var(--ink)]">Where should we deliver?</h2><p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">Use the recipient’s details so the courier can reach the right person.</p></div>
                </div>

                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Full name</span>
                    <Input autoComplete="name" placeholder="Recipient name" aria-invalid={Boolean(errors.shipping_name)} aria-describedby={errors.shipping_name ? "shipping-name-error" : undefined} {...register("shipping_name", { required: "Enter the recipient name." })} />
                    <span id="shipping-name-error"><FieldError message={errors.shipping_name?.message} /></span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Phone number</span>
                    <Input type="tel" autoComplete="tel" inputMode="tel" placeholder="03XX XXXXXXX" aria-invalid={Boolean(errors.shipping_phone)} aria-describedby={errors.shipping_phone ? "shipping-phone-error" : undefined} {...register("shipping_phone", { required: "Enter a contact number." })} />
                    <span id="shipping-phone-error"><FieldError message={errors.shipping_phone?.message} /></span>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Delivery address</span>
                    <Textarea autoComplete="street-address" className="min-h-28" placeholder="House, street, area, city and postal code" aria-invalid={Boolean(errors.shipping_address)} aria-describedby={errors.shipping_address ? "shipping-address-error" : undefined} {...register("shipping_address", { required: "Enter a complete delivery address." })} />
                    <span id="shipping-address-error"><FieldError message={errors.shipping_address?.message} /></span>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-[color:var(--ink)]">Billing address <span className="font-normal text-[color:var(--muted)]">(optional)</span></span>
                    <Input autoComplete="billing street-address" placeholder="Only if different from the delivery address" {...register("billing_address")} />
                  </label>
                </div>
              </section>

              <section aria-labelledby="payment-heading" className="rounded-[24px] bg-white p-5 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055] sm:p-8">
                <div className="flex items-start gap-4 border-b border-[color:var(--line)] pb-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[color:var(--accent)] text-white"><CreditCard size={18} /></span>
                  <div><p className="eyebrow">Step 2</p><h2 id="payment-heading" className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-[color:var(--ink)]">Choose payment</h2><p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">Select the option that works best for this order.</p></div>
                </div>

                <fieldset className="mt-7">
                  <legend className="sr-only">Payment method</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {paymentMethods.map((method) => {
                      const active = method.available && selectedPayment === method.value;
                      return (
                        <label key={method.value} className={cn("relative flex min-h-[112px] items-start gap-3 rounded-2xl p-4 ring-1 transition duration-200", method.available ? "cursor-pointer" : "cursor-not-allowed opacity-55", active ? "bg-[color:var(--accent-wash)] ring-[color:var(--accent)]" : method.available ? "bg-[color:var(--canvas-deep)] ring-transparent hover:bg-[#f0f3f0]" : "bg-[color:var(--canvas-deep)] ring-transparent")}>
                          <input type="radio" value={method.value} disabled={!method.available} className="peer sr-only" {...register("payment_method", { required: true })} />
                          <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl transition", active ? "bg-white text-[color:var(--accent-dark)]" : "bg-white text-[color:var(--ink)]")}><method.icon size={17} /></span>
                          <span className="pr-5"><span className="block text-sm font-semibold text-[color:var(--ink)]">{method.label}</span><span className="mt-1 block text-xs leading-5 text-[color:var(--muted)]">{method.copy}</span></span>
                          {method.available ? <span className={cn("absolute right-4 top-4 grid size-5 place-items-center rounded-full border transition", active ? "border-[color:var(--accent)] bg-[color:var(--accent)] text-white" : "border-[color:var(--line-dark)] bg-white text-transparent")}><Check size={12} /></span> : <span className="absolute right-3 top-3 rounded-full bg-white px-2 py-1 text-[0.62rem] font-semibold text-[color:var(--muted)]">Unavailable</span>}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                <div className="mt-6 grid gap-5 border-t border-[color:var(--line)] pt-6 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]"><Tag size={14} className="text-[color:var(--accent)]" /> Coupon code <span className="font-normal text-[color:var(--muted)]">(optional)</span></span>
                    <Input autoCapitalize="characters" placeholder="Enter code" {...register("coupon_code")} />
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[color:var(--ink)]"><MessageSquareText size={14} className="text-[color:var(--accent)]" /> Order notes <span className="font-normal text-[color:var(--muted)]">(optional)</span></span>
                    <Textarea className="min-h-24" placeholder="Delivery instructions" {...register("notes")} />
                  </label>
                </div>
              </section>
            </div>

            <aside className="h-fit lg:sticky lg:top-[var(--sticky-shell-offset)] lg:transition-[top] lg:duration-300" aria-label="Order summary">
              <div className="overflow-hidden rounded-[24px] bg-[color:var(--canvas-deep)]">
                <div className="flex items-end justify-between gap-4 px-5 pb-5 pt-6 sm:px-7">
                  <div><p className="eyebrow">Order summary</p><h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">{lines.reduce((count, item) => count + item.quantity, 0)} items</h2></div>
                  <Link href="/cart" className="min-h-11 py-3 text-xs font-semibold text-[color:var(--muted)] transition hover:text-[color:var(--ink)]">Edit bag</Link>
                </div>
                <div className="max-h-72 space-y-4 overflow-y-auto border-y border-[color:var(--line-dark)] bg-white px-5 py-5 sm:px-7">
                  {lines.map((line) => {
                    const product = catalog.find((item) => item.id === line.product_id);
                    return (
                      <div key={line.id} className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-3">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[color:var(--canvas-deep)]"><AssetImage src={primaryImage(product)} alt={line.product?.name || product?.name || "Product"} fill sizes="64px" className="object-contain p-1.5" /></div>
                        <div className="min-w-0"><p className="line-clamp-2 text-sm font-semibold leading-5 text-[color:var(--ink)]">{line.product?.name || product?.name || "Product"}</p><p className="mt-1 text-xs text-[color:var(--muted)]">Qty {line.quantity}</p></div>
                        <p className="text-sm font-semibold tabular-nums text-[color:var(--ink)]">{formatCurrency((line.product?.price || product?.price || 0) * line.quantity)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="p-5 sm:p-7">
                  <dl className="space-y-3.5 text-sm text-[color:var(--muted)]">
                    <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd className="font-medium text-[color:var(--ink)]">{formatCurrency(subtotal)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Tax</dt><dd className="font-medium text-[color:var(--ink)]">{formatCurrency(tax)}</dd></div>
                    <div className="flex justify-between gap-4"><dt>Delivery</dt><dd className="font-medium text-[color:var(--ink)]">{formatCurrency(shipping)}</dd></div>
                    <div className="flex items-baseline justify-between gap-4 border-t border-[color:var(--line-dark)] pt-5"><dt className="font-semibold text-[color:var(--ink)]">Total</dt><dd className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--ink)]">{formatCurrency(total)}</dd></div>
                  </dl>

                  {submitError ? <div role="alert" className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-[color:var(--danger)]"><CircleAlert size={16} className="mt-1 shrink-0" />{submitError}</div> : null}
                  <Button className="mt-6 min-h-12 w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? "Preparing your order…" : `${selectedPayment === "cash_on_delivery" ? "Place order" : "Continue to payment"} · ${formatCurrency(total)}`}</Button>
                  <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-5 text-[color:var(--muted)]"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-[color:var(--accent)]" /> By placing your order, you confirm the details above.</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-[color:var(--muted)]">
                <p className="flex items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-black/[0.055]"><Truck size={15} className="shrink-0 text-[color:var(--accent)]" /> Tracked delivery</p>
                <p className="flex items-center gap-2 rounded-xl bg-white p-3 ring-1 ring-black/[0.055]"><ShieldCheck size={15} className="shrink-0 text-[color:var(--accent)]" /> Protected details</p>
              </div>
            </aside>
          </form>
        )}
      </section>
    </div>
  );
}
