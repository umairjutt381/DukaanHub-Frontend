"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Search } from "lucide-react";

import { api } from "@/lib/api/client";
import { AdminEmptyState, AdminPanel, AdminShell } from "@/components/admin/admin-shell";

export default function AdminMessagesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/admin/messages").then((res) => setItems(res.data)).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((message) => [message.name, message.email, message.subject, message.message].some((value) => String(value || "").toLowerCase().includes(normalized)));
  }, [items, query]);

  return (
    <AdminShell title="Messages">
      <AdminPanel
        title="Customer inbox"
        description="Questions and support requests submitted through the storefront."
        action={<label className="relative w-full sm:w-64"><span className="sr-only">Search messages</span><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--admin-muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search messages" className="h-10 w-full rounded-xl border border-[color:var(--admin-line)] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[color:var(--admin-accent)]" /></label>}
      >
        {loading ? <div className="h-96 animate-pulse bg-black/[0.04]" /> : filteredItems.length ? (
          <div className="divide-y divide-[color:var(--admin-line)]">
            {filteredItems.map((message) => (
              <article key={message.id} className="px-5 py-5 transition hover:bg-black/[0.018] sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"><Mail size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div><p className="text-sm font-semibold text-[color:var(--admin-ink)]">{message.name || message.email || "Anonymous visitor"}</p><p className="mt-1 text-xs text-[color:var(--admin-muted)]">{message.email || "No email address"}</p></div>
                      <time className="shrink-0 text-xs text-[color:var(--admin-muted)]">{message.created_at ? new Date(message.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Date unavailable"}</time>
                    </div>
                    {message.subject ? <p className="mt-4 text-sm font-semibold text-[color:var(--admin-ink)]">{message.subject}</p> : null}
                    <p className="mt-2 max-w-4xl whitespace-pre-wrap text-sm leading-6 text-[color:var(--admin-muted)]">{message.message}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : <AdminEmptyState title={items.length ? "No matching messages" : "Inbox is clear"} description={items.length ? "Try another sender, subject, or message keyword." : "New contact requests will appear here as they arrive."} />}
      </AdminPanel>
    </AdminShell>
  );
}
