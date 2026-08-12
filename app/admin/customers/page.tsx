"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";

import { api } from "@/lib/api/client";
import { AdminEmptyState, AdminPanel, AdminShell, AdminStatus } from "@/components/admin/admin-shell";

export default function AdminCustomersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/admin/customers").then((res) => setItems(res.data)).catch(() => setItems([])).finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((customer) => [customer.full_name, customer.email, customer.phone].some((value) => String(value || "").toLowerCase().includes(normalized)));
  }, [items, query]);

  return (
    <AdminShell title="Customers">
      <AdminPanel
        title="Customer directory"
        description={`${items.length} customer${items.length === 1 ? "" : "s"} registered with the store.`}
        action={<label className="relative w-full sm:w-64"><span className="sr-only">Search customers</span><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--admin-muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers" className="h-10 w-full rounded-xl border border-[color:var(--admin-line)] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[color:var(--admin-accent)]" /></label>}
      >
        {loading ? <div className="h-80 animate-pulse bg-black/[0.04]" /> : filteredItems.length ? (
          <div className="divide-y divide-[color:var(--admin-line)]">
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(160px,0.8fr)_140px] gap-5 bg-black/[0.025] px-6 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.11em] text-[color:var(--admin-muted)] md:grid"><span>Customer</span><span>Phone</span><span>Account</span></div>
            {filteredItems.map((customer) => {
              const initials = String(customer.full_name || customer.email || "Customer").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
              return (
                <div key={customer.id} className="grid gap-4 px-5 py-4 transition hover:bg-black/[0.018] md:grid-cols-[minmax(0,1.4fr)_minmax(160px,0.8fr)_140px] md:items-center md:px-6">
                  <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--admin-accent-soft)] text-xs font-bold text-[color:var(--admin-accent-dark)]">{initials || <Users size={16} />}</span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[color:var(--admin-ink)]">{customer.full_name || "Unnamed customer"}</p><p className="mt-1 truncate text-xs text-[color:var(--admin-muted)]">{customer.email}</p></div></div>
                  <p className="text-sm text-[color:var(--admin-muted)]">{customer.phone || "Not provided"}</p>
                  <div><AdminStatus label={customer.is_verified ? "Verified" : "Pending"} tone={customer.is_verified ? "success" : "warning"} /></div>
                </div>
              );
            })}
          </div>
        ) : <AdminEmptyState title={items.length ? "No matching customers" : "No customers yet"} description={items.length ? "Try searching with a different name, email, or phone number." : "New customer accounts will appear here automatically."} />}
      </AdminPanel>
    </AdminShell>
  );
}
