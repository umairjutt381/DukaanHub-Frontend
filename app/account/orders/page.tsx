"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronRight, CreditCard, Package, ShoppingBag, Truck } from "lucide-react";

import { AccountCount, AccountShell } from "@/components/account/account-shell";
import { AccountEmptyState, AccountErrorState, AccountPageSkeleton } from "@/components/account/account-states";
import type { AccountOrder } from "@/components/account/types";
import { getRequestStatus, useAccountSession } from "@/components/account/use-account-session";
import { api } from "@/lib/api/client";
import { formatCurrency } from "@/lib/utils";

function formatLabel(value?: string) {
  if (!value) return "Not available";
  if (["cod", "cash_on_delivery"].includes(value.toLowerCase())) return "Cash on delivery";
  return value.replace(/_/g, " ");
}

function StatusPill({ value }: { value?: string }) {
  const label = formatLabel(value);
  const status = (value || "").toLowerCase();
  const positive = ["paid", "delivered", "completed", "confirmed"].includes(status);
  const negative = ["cancelled", "failed", "refunded"].includes(status);
  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-[0.68rem] font-semibold capitalize ${positive ? "bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]" : negative ? "bg-red-50 text-red-700" : "bg-[color:var(--canvas-deep)] text-[color:var(--muted)]"}`}>
      {label}
    </span>
  );
}

export default function AccountOrdersPage() {
  const { ready, user, signOut, handleUnauthorized } = useAccountSession();
  const [items, setItems] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(false);
    try {
      const response = await api.get<AccountOrder[]>("/orders/me");
      setItems(response.data);
    } catch (requestError) {
      if (getRequestStatus(requestError) === 401) {
        handleUnauthorized();
        return;
      }
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized, ready]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <AccountShell
      title="Your orders"
      description="Every purchase, payment detail, and delivery update in one place."
      user={user}
      onSignOut={signOut}
      meta={!loading && !error ? <AccountCount>{items.length} order{items.length === 1 ? "" : "s"}</AccountCount> : undefined}
    >
      {loading || !ready ? <AccountPageSkeleton /> : null}
      {!loading && error ? <AccountErrorState onRetry={() => void loadOrders()} /> : null}

      {!loading && !error && items.length ? (
        <div className="space-y-5">
          {items.map((order) => {
            const itemSummary = order.items?.slice(0, 2).map((item) => item.product_name).filter(Boolean).join(", ") || "Order items";
            return (
              <article key={order.id} className="group overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055] transition duration-300 hover:shadow-[var(--shadow)]">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[color:var(--canvas-deep)] px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[color:var(--ink)] shadow-[var(--shadow-xs)]"><Package size={16} aria-hidden="true" /></span>
                    <div>
                      <p className="text-xs text-[color:var(--muted)]">Order number</p>
                      <p className="mt-0.5 text-sm font-semibold text-[color:var(--ink)]">{order.order_number}</p>
                    </div>
                  </div>
                  <StatusPill value={order.status} />
                </div>

                <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-base font-semibold leading-6 tracking-[-0.015em] text-[color:var(--ink)]">
                      {itemSummary}{order.items?.length > 2 ? ` +${order.items.length - 2} more` : ""}
                    </p>
                    <p className="mt-1.5 text-xs text-[color:var(--muted)]">{order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"} in this order</p>

                    <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3 border-t border-[color:var(--line)] pt-4 text-xs text-[color:var(--muted)]">
                      <span className="flex items-center gap-2"><CreditCard size={14} aria-hidden="true" /> Method: <strong className="font-semibold capitalize text-[color:var(--ink-soft)]">{formatLabel(order.payment_method)}</strong></span>
                      <span className="flex items-center gap-2"><Truck size={14} aria-hidden="true" /> Payment: <strong className="font-semibold capitalize text-[color:var(--ink-soft)]">{formatLabel(order.payment_status)}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-5 lg:flex-col lg:items-end">
                    <div className="lg:text-right">
                      <p className="text-xs text-[color:var(--muted)]">Order total</p>
                      <p className="mt-1 text-xl font-semibold tracking-[-0.03em] text-[color:var(--ink)]">{formatCurrency(order.total_amount || 0)}</p>
                    </div>
                    <Link href={`/track-order?order=${encodeURIComponent(order.order_number)}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2">
                      Track order <ChevronRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          <div className="flex flex-col items-start justify-between gap-4 rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <p className="text-sm font-semibold text-[color:var(--ink)]">Looking for something new?</p>
              <p className="mt-1 text-xs text-[color:var(--muted)]">Explore products selected from trusted brands.</p>
            </div>
            <Link href="/products" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[color:var(--ink)]">Continue shopping <ArrowRight size={16} /></Link>
          </div>
        </div>
      ) : null}

      {!loading && !error && !items.length ? (
        <AccountEmptyState
          icon={ShoppingBag}
          title="Your order history starts here"
          description="After your first checkout, you’ll be able to follow payment and delivery progress from this page."
          href="/products"
          action="Explore products"
        />
      ) : null}
    </AccountShell>
  );
}
