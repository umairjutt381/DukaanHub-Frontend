"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, ChevronRight, LogOut, Mail, MapPin, Package, ShieldCheck, ShoppingBag, Truck } from "lucide-react";

import { AccountSectionHeader, AccountShell } from "@/components/account/account-shell";
import { AccountErrorState, AccountPageSkeleton } from "@/components/account/account-states";
import type { AccountAddress, AccountNotification, AccountOrder } from "@/components/account/types";
import { getRequestStatus, useAccountSession } from "@/components/account/use-account-session";
import { api } from "@/lib/api/client";
import type { AuthUser } from "@/lib/store/auth";
import { formatCurrency } from "@/lib/utils";

function StatusPill({ value }: { value?: string }) {
  const label = (value || "pending").replace(/_/g, " ");
  const positive = ["paid", "delivered", "completed", "confirmed"].includes(label.toLowerCase());
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold capitalize ${positive ? "bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]" : "bg-[color:var(--canvas-deep)] text-[color:var(--muted)]"}`}>{label}</span>;
}

export default function AccountPage() {
  const { ready, user, signOut, handleUnauthorized } = useAccountSession();
  const [me, setMe] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [addresses, setAddresses] = useState<AccountAddress[]>([]);
  const [notifications, setNotifications] = useState<AccountNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadAccount = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(false);
    try {
      const [meRes, ordersRes, addressesRes, notificationsRes] = await Promise.all([
        api.get<AuthUser>("/auth/me"),
        api.get<AccountOrder[]>("/orders/me"),
        api.get<AccountAddress[]>("/addresses"),
        api.get<AccountNotification[]>("/notifications")
      ]);
      setMe(meRes.data);
      setOrders(ordersRes.data);
      setAddresses(addressesRes.data);
      setNotifications(notificationsRes.data);
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
    void loadAccount();
  }, [loadAccount]);

  const accountUser = me || user;
  const accountName = accountUser?.full_name || "Customer";
  const firstName = accountName.split(" ")[0];
  const unreadCount = useMemo(() => notifications.filter((item) => !item.is_read).length, [notifications]);
  const defaultAddress = addresses.find((address) => address.is_default) || addresses[0];

  return (
    <AccountShell
      title={loading ? "Your account" : `Welcome back, ${firstName}.`}
      description="A clear view of your purchases, delivery details, and important updates."
      user={accountUser}
      onSignOut={signOut}
      meta={<span className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--muted)]"><ShieldCheck size={16} className="text-[color:var(--accent)]" /> Secure account</span>}
    >
      {loading || !ready ? <AccountPageSkeleton variant="overview" /> : null}
      {!loading && error ? <AccountErrorState onRetry={() => void loadAccount()} /> : null}

      {!loading && !error ? (
        <div className="space-y-10">
          <section aria-label="Account summary" className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total orders", value: orders.length, href: "/account/orders", icon: Package, note: "View purchase history" },
              { label: "Saved addresses", value: addresses.length, href: "/account/addresses", icon: MapPin, note: "Your delivery details" },
              { label: "Unread updates", value: unreadCount, href: "/account/notifications", icon: Bell, note: unreadCount ? "New information waiting" : "You’re all caught up" }
            ].map((metric) => (
              <Link key={metric.label} href={metric.href} className="group rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] p-5 transition duration-300 hover:-translate-y-0.5 hover:bg-[#f0f3f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[color:var(--ink)] shadow-[var(--shadow-xs)]"><metric.icon size={17} aria-hidden="true" /></span>
                  <ChevronRight size={16} className="text-[color:var(--muted-light)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--ink)]" aria-hidden="true" />
                </div>
                <p className="mt-7 text-4xl font-semibold tracking-[-0.055em] text-[color:var(--ink)]">{metric.value}</p>
                <p className="mt-2 text-sm font-semibold text-[color:var(--ink)]">{metric.label}</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{metric.note}</p>
              </Link>
            ))}
          </section>

          <section className="flex flex-col gap-5 rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-label="Account details">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--ink)] shadow-[var(--shadow-xs)]">
                <Mail size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">Registered email</p>
                <p className="mt-1 truncate text-sm font-semibold text-[color:var(--ink)]">{accountUser?.email || "Email unavailable"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[color:var(--ink)] shadow-[var(--shadow-xs)] ring-1 ring-black/[0.06] transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </section>

          <section>
            <AccountSectionHeader
              title="Recent orders"
              description="Your latest purchases and delivery status."
              action={<Link href="/account/orders" className="quiet-link shrink-0">View all</Link>}
            />
            <div className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055]">
              {orders.length ? (
                <div className="divide-y divide-[color:var(--line)]">
                  {orders.slice(0, 4).map((order) => (
                    <article key={order.id} className="grid gap-4 px-5 py-5 transition hover:bg-[#fbfcfb] sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6">
                      <div className="flex min-w-0 items-center gap-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--canvas-deep)] text-[color:var(--ink)]"><ShoppingBag size={17} aria-hidden="true" /></span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[color:var(--ink)]">Order {order.order_number}</p>
                          <p className="mt-1 truncate text-xs text-[color:var(--muted)]">{order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"}{order.items?.[0]?.product_name ? ` · ${order.items[0].product_name}` : ""}</p>
                        </div>
                      </div>
                      <StatusPill value={order.status} />
                      <div className="flex items-center justify-between gap-5 sm:justify-end">
                        <p className="text-sm font-semibold text-[color:var(--ink)]">{formatCurrency(order.total_amount || 0)}</p>
                        <Link href={`/track-order?order=${encodeURIComponent(order.order_number)}`} aria-label={`Track order ${order.order_number}`} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--canvas-deep)]">Track <ChevronRight size={14} /></Link>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <ShoppingBag className="mx-auto text-[color:var(--muted-light)]" size={24} />
                  <p className="mt-3 text-sm font-semibold text-[color:var(--ink)]">No orders yet</p>
                  <p className="mt-1 text-sm text-[color:var(--muted)]">Your purchase history will appear here after checkout.</p>
                  <Link href="/products" className="mt-4 inline-flex text-sm font-semibold text-[color:var(--accent-dark)] hover:underline">Start shopping</Link>
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <Link href="/account/addresses" className="group rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055] transition hover:shadow-[var(--shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]"><Truck size={18} /></span>
                <ChevronRight size={17} className="text-[color:var(--muted-light)] transition group-hover:translate-x-0.5" />
              </div>
              <h2 className="mt-5 text-base font-semibold text-[color:var(--ink)]">Default delivery address</h2>
              {defaultAddress ? (
                <address className="mt-2 not-italic text-sm leading-6 text-[color:var(--muted)]">
                  <span className="block font-medium text-[color:var(--ink-soft)]">{defaultAddress.label || "Saved address"}</span>
                  {defaultAddress.line1 || defaultAddress.address_line1}{defaultAddress.city ? `, ${defaultAddress.city}` : ""}
                </address>
              ) : <p className="mt-2 text-sm text-[color:var(--muted)]">No delivery address saved yet.</p>}
            </Link>

            <Link href="/account/notifications" className="group rounded-[var(--radius-lg)] bg-white p-6 shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055] transition hover:shadow-[var(--shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--canvas-deep)] text-[color:var(--ink)]"><Bell size={18} /></span>
                <ChevronRight size={17} className="text-[color:var(--muted-light)] transition group-hover:translate-x-0.5" />
              </div>
              <h2 className="mt-5 text-base font-semibold text-[color:var(--ink)]">Latest update</h2>
              {notifications[0] ? (
                <div className="mt-2"><p className="text-sm font-medium text-[color:var(--ink-soft)]">{notifications[0].title}</p><p className="mt-1 line-clamp-2 text-sm leading-6 text-[color:var(--muted)]">{notifications[0].body}</p></div>
              ) : <p className="mt-2 text-sm text-[color:var(--muted)]">You are all caught up.</p>}
            </Link>
          </section>
        </div>
      ) : null}
    </AccountShell>
  );
}
