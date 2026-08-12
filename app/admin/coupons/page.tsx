"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, TicketPercent, Trash2 } from "lucide-react";

import { api } from "@/lib/api/client";
import { AdminConfirmDialog, AdminEmptyState, AdminField, AdminPanel, AdminShell, AdminStatus } from "@/components/admin/admin-shell";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

type CouponForm = {
  code: string;
  discount_type: string;
  discount_value: string;
  min_order_amount: string;
  max_discount_amount: string;
  is_active: boolean;
};

const defaults: CouponForm = { code: "", discount_type: "percent", discount_value: "", min_order_amount: "", max_discount_amount: "", is_active: true };

export default function AdminCouponsPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CouponForm>({ defaultValues: defaults });

  const load = async () => {
    const res = await api.get("/admin/coupons");
    setItems(res.data);
  };

  useEffect(() => {
    load().catch(() => notify("Load failed", "Coupons could not be loaded.")).finally(() => setLoading(false));
  }, []);

  const submit = async (values: CouponForm) => {
    try {
      await api.post("/admin/coupons", {
        code: values.code.trim(),
        discount_type: values.discount_type,
        discount_value: Number(values.discount_value || 0),
        min_order_amount: Number(values.min_order_amount || 0),
        max_discount_amount: values.max_discount_amount ? Number(values.max_discount_amount) : null,
        is_active: values.is_active
      });
      await load();
      reset(defaults);
      notify("Coupon created");
    } catch {
      notify("Save failed", "Could not create coupon.");
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/coupons/${deleteTarget.id}`);
      await load();
      notify("Coupon deleted");
      setDeleteTarget(null);
    } catch {
      notify("Delete failed", "This coupon could not be removed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell title="Coupons">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <AdminPanel title="Promotion codes" description="Discounts customers can apply during checkout." action={<span className="text-xs font-semibold text-[color:var(--admin-muted)]">{items.filter((item) => item.is_active).length} active</span>}>
          {loading ? <div className="h-72 animate-pulse bg-black/[0.04]" /> : items.length ? (
            <div className="divide-y divide-[color:var(--admin-line)]">
              <div className="hidden grid-cols-[minmax(0,1fr)_120px_120px_90px] gap-4 bg-black/[0.025] px-6 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.11em] text-[color:var(--admin-muted)] md:grid"><span>Code</span><span>Discount</span><span>Status</span><span className="text-right">Action</span></div>
              {items.map((item) => (
                <div key={item.id} className="grid gap-4 px-5 py-4 transition hover:bg-black/[0.018] md:grid-cols-[minmax(0,1fr)_120px_120px_90px] md:items-center md:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"><TicketPercent size={17} /></span>
                    <div className="min-w-0"><p className="truncate font-mono text-sm font-bold tracking-[0.06em] text-[color:var(--admin-ink)]">{item.code}</p><p className="mt-1 text-xs text-[color:var(--admin-muted)]">Minimum {formatCurrency(item.min_order_amount || 0)}</p></div>
                  </div>
                  <p className="text-sm font-semibold text-[color:var(--admin-ink)]">{item.discount_type === "percent" ? `${item.discount_value}%` : formatCurrency(item.discount_value || 0)}</p>
                  <div><AdminStatus label={item.is_active ? "Active" : "Inactive"} tone={item.is_active ? "success" : "neutral"} /></div>
                  <div className="flex md:justify-end"><button type="button" onClick={() => setDeleteTarget(item)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--admin-muted)] transition hover:bg-red-50 hover:text-[color:var(--admin-danger)]" aria-label={`Delete ${item.code}`}><Trash2 size={15} /></button></div>
                </div>
              ))}
            </div>
          ) : <AdminEmptyState title="No promotion codes" description="Create a coupon when you are ready to run a targeted offer." />}
        </AdminPanel>

        <AdminPanel title="Create promotion" description="Set clear limits before sharing a code with customers." className="h-fit xl:sticky xl:top-7">
          <form onSubmit={handleSubmit(submit)} className="space-y-4 p-5 sm:p-6">
            <AdminField label="Coupon code"><Input placeholder="WELCOME10" className="uppercase" {...register("code", { required: true })} /></AdminField>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <AdminField label="Discount type"><Select {...register("discount_type")}><option value="percent">Percentage</option><option value="fixed">Fixed amount</option></Select></AdminField>
              <AdminField label="Discount value"><Input type="number" step="1" placeholder="10" {...register("discount_value", { required: true })} /></AdminField>
            </div>
            <AdminField label="Minimum order"><Input type="number" step="1" placeholder="0" {...register("min_order_amount")} /></AdminField>
            <AdminField label="Maximum discount" hint="Leave empty if no cap is required."><Input type="number" step="1" placeholder="Optional" {...register("max_discount_amount")} /></AdminField>
            <label className="flex items-start gap-3 rounded-xl border border-[color:var(--admin-line)] bg-black/[0.018] p-3.5">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[color:var(--admin-accent)]" {...register("is_active")} />
              <span><span className="block text-sm font-semibold text-[color:var(--admin-ink)]">Activate immediately</span><span className="mt-0.5 block text-xs leading-5 text-[color:var(--admin-muted)]">The code can be used as soon as it is created.</span></span>
            </label>
            <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--admin-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-accent-dark)] disabled:opacity-55"><Plus size={16} /> {isSubmitting ? "Creating…" : "Create coupon"}</button>
          </form>
        </AdminPanel>
      </div>

      <AdminConfirmDialog open={Boolean(deleteTarget)} title="Delete coupon?" description={`The code “${deleteTarget?.code || "this coupon"}” will stop being available. This action cannot be undone.`} busy={deleting} onConfirm={remove} onCancel={() => setDeleteTarget(null)} />
    </AdminShell>
  );
}
