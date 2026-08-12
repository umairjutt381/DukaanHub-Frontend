"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Check, CheckCircle2, PackageCheck } from "lucide-react";

import { AccountCount, AccountSectionHeader, AccountShell } from "@/components/account/account-shell";
import { AccountEmptyState, AccountErrorState, AccountPageSkeleton } from "@/components/account/account-states";
import type { AccountNotification } from "@/components/account/types";
import { getRequestStatus, useAccountSession } from "@/components/account/use-account-session";
import { api } from "@/lib/api/client";

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function NotificationList({ items }: { items: AccountNotification[] }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] bg-white shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055]">
      <div className="divide-y divide-[color:var(--line)]">
        {items.map((item) => (
          <article key={item.id} className={`relative flex gap-4 px-5 py-5 transition sm:px-6 sm:py-6 ${item.is_read ? "bg-white hover:bg-[#fbfcfb]" : "bg-[linear-gradient(90deg,var(--accent-wash)_0%,#ffffff_72%)]"}`}>
            {!item.is_read ? <span className="absolute bottom-0 left-0 top-0 w-0.5 bg-[color:var(--accent)]" aria-hidden="true" /> : null}
            <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${item.is_read ? "bg-[color:var(--canvas-deep)] text-[color:var(--muted)]" : "bg-[color:var(--accent)] text-white"}`}>
              {item.is_read ? <CheckCircle2 size={17} aria-hidden="true" /> : <Bell size={17} aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <h3 className="text-sm font-semibold text-[color:var(--ink)]">{item.title}</h3>
                {formatDate(item.created_at) ? <time dateTime={item.created_at} className="shrink-0 text-xs text-[color:var(--muted-light)]">{formatDate(item.created_at)}</time> : null}
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[color:var(--muted)]">{item.body}</p>
              {!item.is_read ? <span className="mt-3 inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[color:var(--accent-dark)]"><span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" aria-hidden="true" /> New update</span> : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function AccountNotificationsPage() {
  const { ready, user, signOut, handleUnauthorized } = useAccountSession();
  const [items, setItems] = useState<AccountNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(false);
    try {
      const response = await api.get<AccountNotification[]>("/notifications");
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
    void loadNotifications();
  }, [loadNotifications]);

  const unreadItems = useMemo(() => items.filter((item) => !item.is_read), [items]);
  const readItems = useMemo(() => items.filter((item) => item.is_read), [items]);

  return (
    <AccountShell
      title="Account updates"
      description="Order progress and important information, without the noise."
      user={user}
      onSignOut={signOut}
      meta={!loading && !error ? <AccountCount>{unreadItems.length} unread</AccountCount> : undefined}
    >
      {loading || !ready ? <AccountPageSkeleton /> : null}
      {!loading && error ? <AccountErrorState onRetry={() => void loadNotifications()} /> : null}

      {!loading && !error && items.length ? (
        <div className="space-y-10">
          {unreadItems.length ? (
            <section>
              <AccountSectionHeader title="New for you" description={`${unreadItems.length} update${unreadItems.length === 1 ? "" : "s"} you haven’t read yet.`} />
              <NotificationList items={unreadItems} />
            </section>
          ) : (
            <div className="flex items-center gap-3 rounded-[var(--radius-lg)] bg-[color:var(--accent-wash)] px-5 py-4 text-sm text-[color:var(--accent-dark)]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white"><Check size={15} aria-hidden="true" /></span>
              <span><strong className="font-semibold">You’re up to date.</strong> There are no unread notifications.</span>
            </div>
          )}

          {readItems.length ? (
            <section>
              <AccountSectionHeader title={unreadItems.length ? "Earlier" : "Your updates"} description="Previously seen account and order information." />
              <NotificationList items={readItems} />
            </section>
          ) : null}

          <div className="flex flex-col items-start justify-between gap-3 rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-center gap-3">
              <PackageCheck size={18} className="text-[color:var(--accent)]" aria-hidden="true" />
              <p className="text-sm text-[color:var(--muted)]">Need the latest delivery status? Track it from your order history.</p>
            </div>
            <Link href="/account/orders" className="shrink-0 text-sm font-semibold text-[color:var(--ink)] hover:text-[color:var(--accent-dark)]">View orders</Link>
          </div>
        </div>
      ) : null}

      {!loading && !error && !items.length ? (
        <AccountEmptyState
          icon={Bell}
          title="You’re all caught up"
          description="Order progress and important account updates will appear here when there’s something to share."
          href="/account/orders"
          action="View your orders"
        />
      ) : null}
    </AccountShell>
  );
}
