"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Boxes, CircleDollarSign, PackageSearch, ShoppingBag, Tags, Users } from "lucide-react";

import { api } from "@/lib/api/client";
import { AdminEmptyState, AdminPanel, AdminShell, AdminStatus } from "@/components/admin/admin-shell";
import { formatCurrency } from "@/lib/utils";

const statDefinitions = [
  { key: "revenue", label: "Gross revenue", icon: CircleDollarSign, format: (value: number) => formatCurrency(value || 0) },
  { key: "orders", label: "Total orders", icon: ShoppingBag, format: (value: number) => String(value || 0) },
  { key: "products", label: "Active products", icon: Boxes, format: (value: number) => String(value || 0) },
  { key: "customers", label: "Customers", icon: Users, format: (value: number) => String(value || 0) }
] as const;

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-32 animate-pulse rounded-2xl bg-black/[0.06]" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-2xl bg-black/[0.06]" />
        <div className="h-80 animate-pulse rounded-2xl bg-black/[0.06]" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setData(res.data)).catch(() => setData(null)).finally(() => setLoading(false));
  }, []);

  return (
    <AdminShell title="Dashboard">
      {loading ? <DashboardSkeleton /> : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statDefinitions.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <article key={stat.key} className="relative overflow-hidden rounded-2xl border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] p-5 shadow-[0_10px_35px_rgba(16,18,15,0.045)]">
                  {index === 0 ? <div className="absolute inset-y-0 left-0 w-1 bg-[color:var(--admin-accent)]" /> : null}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-[color:var(--admin-muted)]">{stat.label}</p>
                      <p className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[color:var(--admin-ink)]">{stat.format(data?.[stat.key])}</p>
                    </div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"><Icon size={18} /></span>
                  </div>
                  <p className="mt-5 text-xs text-[color:var(--admin-muted)]">Live storefront total</p>
                </article>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
            <AdminPanel
              title="Recent orders"
              description="Latest orders entering the fulfillment workflow."
              action={<Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--admin-accent-dark)]">View all <ArrowRight size={14} /></Link>}
            >
              {(data?.recent_orders || []).length ? (
                <div className="divide-y divide-[color:var(--admin-line)]">
                  {(data?.recent_orders || []).map((order: any) => (
                    <div key={order.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:px-6">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[color:var(--admin-ink)]">{order.order_number}</p>
                        <p className="mt-1 text-xs text-[color:var(--admin-muted)]">{order.payment_method || "Payment method pending"}</p>
                      </div>
                      <AdminStatus label={order.status} tone={order.status === "delivered" ? "success" : order.status === "cancelled" ? "danger" : "warning"} />
                      <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{formatCurrency(order.total_amount || 0)}</p>
                    </div>
                  ))}
                </div>
              ) : <AdminEmptyState title="No recent orders" description="New orders will appear here as customers complete checkout." />}
            </AdminPanel>

            <AdminPanel
              title="Inventory attention"
              description="Products approaching a low-stock position."
              action={<Link href="/admin/products" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--admin-accent-dark)]">Open catalog <ArrowRight size={14} /></Link>}
            >
              {(data?.inventory_status || []).length ? (
                <div className="divide-y divide-[color:var(--admin-line)]">
                  {(data?.inventory_status || []).map((product: any) => (
                    <div key={product.id} className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[color:var(--admin-ink)]">{product.name}</p>
                        <p className="mt-1 text-xs text-[color:var(--admin-muted)]">Inventory item</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"><PackageSearch size={14} /> {product.stock} left</span>
                    </div>
                  ))}
                </div>
              ) : <AdminEmptyState title="Inventory looks healthy" description="Products with low stock will be surfaced here automatically." />}
            </AdminPanel>
          </div>

          <AdminPanel title="Store structure" description="A quick view of how the live catalog is organized.">
            <div className="grid gap-px bg-[color:var(--admin-line)] sm:grid-cols-3">
              {[
                { label: "Products", value: data?.products || 0, icon: Boxes, href: "/admin/products" },
                { label: "Categories", value: data?.categories || 0, icon: PackageSearch, href: "/admin/categories" },
                { label: "Brands", value: data?.brands || 0, icon: Tags, href: "/admin/brands" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} href={item.href} className="group flex items-center gap-4 bg-[color:var(--admin-surface)] px-5 py-5 transition hover:bg-[color:var(--admin-accent-soft)] sm:px-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--admin-line)] bg-white text-[color:var(--admin-muted)] transition group-hover:border-[color:var(--admin-accent)] group-hover:text-[color:var(--admin-accent)]"><Icon size={18} /></span>
                    <div><p className="text-xl font-semibold text-[color:var(--admin-ink)]">{item.value}</p><p className="text-xs text-[color:var(--admin-muted)]">{item.label}</p></div>
                    <ArrowRight size={15} className="ml-auto text-[color:var(--admin-muted)] transition group-hover:translate-x-0.5 group-hover:text-[color:var(--admin-accent)]" />
                  </Link>
                );
              })}
            </div>
          </AdminPanel>
        </div>
      )}
    </AdminShell>
  );
}
