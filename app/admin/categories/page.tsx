"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";

import { api } from "@/lib/api/client";
import { AdminConfirmDialog, AdminEmptyState, AdminField, AdminPanel, AdminShell, AdminStatus } from "@/components/admin/admin-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

type CategoryForm = {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  is_featured: boolean;
};

const defaults: CategoryForm = { name: "", slug: "", description: "", image_url: "", is_featured: false };

export default function AdminCategoriesPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CategoryForm>({ defaultValues: defaults });

  const load = async () => {
    const res = await api.get("/admin/categories");
    setItems(res.data);
  };

  useEffect(() => {
    load().catch(() => notify("Load failed", "Categories could not be loaded.")).finally(() => setLoading(false));
  }, []);

  const beginEdit = (item: any) => {
    setEditingId(item.id);
    reset({ name: item.name, slug: item.slug, description: item.description || "", image_url: item.image_url || "", is_featured: item.is_featured });
  };

  const cancel = () => {
    setEditingId(null);
    reset(defaults);
  };

  const submit = async (values: CategoryForm) => {
    const payload = { ...values, description: values.description || null, image_url: values.image_url || null };
    try {
      if (editingId) {
        await api.put(`/admin/categories/${editingId}`, payload);
        notify("Category updated");
      } else {
        await api.post("/admin/categories", payload);
        notify("Category created");
      }
      await load();
      cancel();
    } catch {
      notify("Save failed", "Could not persist category changes.");
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/admin/categories/${deleteTarget.id}`);
      await load();
      notify("Category deleted");
      setDeleteTarget(null);
    } catch {
      notify("Delete failed", "This category could not be removed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell title="Categories">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <AdminPanel title="Catalog categories" description="Collections currently available to organize products." action={<span className="text-xs font-semibold text-[color:var(--admin-muted)]">{items.length} total</span>}>
          {loading ? <div className="h-72 animate-pulse bg-black/[0.04]" /> : items.length ? (
            <div className="divide-y divide-[color:var(--admin-line)]">
              <div className="hidden grid-cols-[minmax(0,1fr)_140px_100px] gap-4 bg-black/[0.025] px-6 py-3 text-[0.67rem] font-semibold uppercase tracking-[0.11em] text-[color:var(--admin-muted)] md:grid">
                <span>Category</span><span>Visibility</span><span className="text-right">Actions</span>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid gap-4 px-5 py-4 transition hover:bg-black/[0.018] md:grid-cols-[minmax(0,1fr)_140px_100px] md:items-center md:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"><FolderTree size={17} /></span>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-[color:var(--admin-ink)]">{item.name}</p><p className="mt-1 truncate text-xs text-[color:var(--admin-muted)]">/{item.slug}</p></div>
                  </div>
                  <div><AdminStatus label={item.is_featured ? "Featured" : "Standard"} tone={item.is_featured ? "success" : "neutral"} /></div>
                  <div className="flex items-center gap-1 md:justify-end">
                    <button type="button" onClick={() => beginEdit(item)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--admin-muted)] transition hover:bg-[color:var(--admin-accent-soft)] hover:text-[color:var(--admin-accent)]" aria-label={`Edit ${item.name}`}><Pencil size={15} /></button>
                    <button type="button" onClick={() => setDeleteTarget(item)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--admin-muted)] transition hover:bg-red-50 hover:text-[color:var(--admin-danger)]" aria-label={`Delete ${item.name}`}><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : <AdminEmptyState title="No categories yet" description="Create the first category to give products a clear place in the catalog." />}
        </AdminPanel>

        <AdminPanel title={editingId ? "Edit category" : "Create category"} description={editingId ? "Update how this collection appears in the store." : "Add a new collection to the storefront."} className="h-fit xl:sticky xl:top-7">
          <form onSubmit={handleSubmit(submit)} className="space-y-4 p-5 sm:p-6">
            <AdminField label="Category name"><Input placeholder="e.g. Home & Living" {...register("name", { required: true })} /></AdminField>
            <AdminField label="URL slug" hint="Lowercase words separated by hyphens."><Input placeholder="home-living" {...register("slug", { required: true })} /></AdminField>
            <AdminField label="Description"><Textarea placeholder="Describe what customers will find here." {...register("description")} /></AdminField>
            <AdminField label="Image URL"><Input placeholder="https://…" {...register("image_url")} /></AdminField>
            <label className="flex items-start gap-3 rounded-xl border border-[color:var(--admin-line)] bg-black/[0.018] p-3.5">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[color:var(--admin-accent)]" {...register("is_featured")} />
              <span><span className="block text-sm font-semibold text-[color:var(--admin-ink)]">Feature this category</span><span className="mt-0.5 block text-xs leading-5 text-[color:var(--admin-muted)]">Eligible for prominent storefront placement.</span></span>
            </label>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={isSubmitting} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[color:var(--admin-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-accent-dark)] disabled:opacity-55"><Plus size={16} /> {isSubmitting ? "Saving…" : editingId ? "Update category" : "Create category"}</button>
              {editingId ? <button type="button" onClick={cancel} className="rounded-xl border border-[color:var(--admin-line)] px-4 py-3 text-sm font-semibold text-[color:var(--admin-ink)] transition hover:border-[color:var(--admin-ink)]">Cancel</button> : null}
            </div>
          </form>
        </AdminPanel>
      </div>

      <AdminConfirmDialog open={Boolean(deleteTarget)} title="Delete category?" description={`“${deleteTarget?.name || "This category"}” will be removed from catalog organization. This action cannot be undone.`} busy={deleting} onConfirm={remove} onCancel={() => setDeleteTarget(null)} />
    </AdminShell>
  );
}
