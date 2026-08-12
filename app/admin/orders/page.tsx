"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Search, ShoppingBag } from "lucide-react";

import { api } from "@/lib/api/client";
import { AdminEmptyState, AdminPanel, AdminShell, AdminStatus } from "@/components/admin/admin-shell";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

const statuses = ["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

function statusTone(status: string): "success" | "warning" | "danger" | "neutral" {
  if (status === "delivered") return "success";
  if (status === "cancelled") return "danger";
  if (status === "pending") return "warning";
  return "neutral";
}

export default function AdminOrdersPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const load = async () => {
    const res = await api.get("/admin/orders");
    setItems(res.data);
    setDrafts(Object.fromEntries(res.data.map((order: any) => [order.order_number, order.status])));
  };

  useEffect(() => {
    load().catch(() => notify("Load failed", "Orders could not be loaded.")).finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesQuery = !normalized || String(order.order_number).toLowerCase().includes(normalized) || String(order.payment_method || "").toLowerCase().includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [items, query, statusFilter]);

  const updateStatus = async (orderNumber: string) => {
    try {
      setBusy(orderNumber);
      await api.patch(`/orders/${orderNumber}/status`, null, { params: { status: drafts[orderNumber] } });
      await load();
      notify("Order updated");
    } catch {
      notify("Update failed", "Order status could not be changed.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AdminShell title="Orders">
      <AdminPanel
        title="Order workflow"
        description="Search orders and update each fulfillment stage."
        action={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <label className="relative min-w-0 sm:w-56"><span className="sr-only">Search orders</span><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--admin-muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order number" className="h-10 w-full rounded-xl border border-[color:var(--admin-line)] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[color:var(--admin-accent)]" /></label>
            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 py-0 sm:w-40"><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</Select>
          </div>
        }
      >
        {loading ? <div className="h-96 animate-pulse bg-black/[0.04]" /> : filteredItems.length ? (
          <div className="divide-y divide-[color:var(--admin-line)]">
            {filteredItems.map((order) => (
              <article key={order.id} className="px-5 py-5 transition hover:bg-black/[0.015] sm:px-6">
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_190px_auto] lg:items-center">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"><ShoppingBag size={17} /></span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-[color:var(--admin-ink)]">{order.order_number}</p><AdminStatus label={order.status} tone={statusTone(order.status)} /></div>
                      <p className="mt-1.5 text-xs text-[color:var(--admin-muted)]">{order.payment_method || "Payment pending"} · {formatCurrency(order.total_amount || 0)}</p>
                    </div>
                  </div>
                  <Select value={drafts[order.order_number] || order.status} onChange={(event) => setDrafts((current) => ({ ...current, [order.order_number]: event.target.value }))} className="h-10 py-0 capitalize">
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </Select>
                  <button type="button" onClick={() => updateStatus(order.order_number)} disabled={busy === order.order_number || drafts[order.order_number] === order.status} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[color:var(--admin-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-accent-dark)] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-[color:var(--admin-muted)]">
                    <CheckCircle2 size={15} /> {busy === order.order_number ? "Saving…" : "Save status"}
                  </button>
                </div>
                <dl className="mt-4 grid gap-3 rounded-xl border border-[color:var(--admin-line)] bg-black/[0.018] p-4 text-xs sm:grid-cols-2 xl:grid-cols-4">
                  <div><dt className="text-[color:var(--admin-muted)]">Items</dt><dd className="mt-1 font-semibold text-[color:var(--admin-ink)]">{order.items?.length || 0}</dd></div>
                  <div><dt className="text-[color:var(--admin-muted)]">Subtotal</dt><dd className="mt-1 font-semibold text-[color:var(--admin-ink)]">{formatCurrency(order.subtotal || 0)}</dd></div>
                  <div><dt className="text-[color:var(--admin-muted)]">Tax</dt><dd className="mt-1 font-semibold text-[color:var(--admin-ink)]">{formatCurrency(order.tax || 0)}</dd></div>
                  <div><dt className="text-[color:var(--admin-muted)]">Order total</dt><dd className="mt-1 font-semibold text-[color:var(--admin-ink)]">{formatCurrency(order.total_amount || 0)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        ) : <AdminEmptyState title={items.length ? "No matching orders" : "No orders yet"} description={items.length ? "Try a different order number or status filter." : "Orders will appear here after customers complete checkout."} />}
      </AdminPanel>
    </AdminShell>
  );
}
