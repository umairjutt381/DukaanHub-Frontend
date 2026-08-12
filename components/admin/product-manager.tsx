"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { AlertTriangle, BadgePercent, Boxes, ImageIcon, Pencil, Plus, RefreshCw, Search, Star, Trash2, Upload } from "lucide-react";

import { api } from "@/lib/api/client";
import { AdminConfirmDialog, AdminEmptyState, AdminField, AdminPanel, AdminStatus } from "@/components/admin/admin-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { AssetImage } from "@/components/ui/asset-image";
import { Brand, Category, Product } from "@/lib/types";

type ProductFormValues = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  specifications: string;
  tags: string;
  price: string;
  compare_at_price: string;
  stock: string;
  category_id: string;
  brand_id: string;
  seo_title: string;
  seo_description: string;
  image_url: string;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new_arrival: boolean;
  is_deal: boolean;
  is_active: boolean;
};

const defaults: ProductFormValues = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  specifications: "",
  tags: "",
  price: "",
  compare_at_price: "",
  stock: "0",
  category_id: "",
  brand_id: "",
  seo_title: "",
  seo_description: "",
  image_url: "",
  is_featured: false,
  is_best_seller: false,
  is_new_arrival: false,
  is_deal: false,
  is_active: true
};

function toNumber(value: string) {
  return value.trim() ? Number(value) : null;
}

function normalize(values: ProductFormValues) {
  return {
    name: values.name.trim(),
    slug: values.slug.trim(),
    sku: values.sku.trim(),
    description: values.description.trim(),
    specifications: values.specifications.trim() || null,
    tags: values.tags.trim() || null,
    price: Number(values.price),
    compare_at_price: toNumber(values.compare_at_price),
    stock: Number(values.stock || 0),
    category_id: toNumber(values.category_id),
    brand_id: toNumber(values.brand_id),
    seo_title: values.seo_title.trim() || null,
    seo_description: values.seo_description.trim() || null,
    is_featured: values.is_featured,
    is_best_seller: values.is_best_seller,
    is_new_arrival: values.is_new_arrival,
    is_deal: values.is_deal,
    is_active: values.is_active
  };
}

const metricDefinitions = [
  { key: "total", label: "Products", icon: Boxes },
  { key: "featured", label: "Featured", icon: Star },
  { key: "deals", label: "On offer", icon: BadgePercent },
  { key: "lowStock", label: "Low stock", icon: AlertTriangle }
] as const;

export function ProductManager() {
  const { notify } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<ProductFormValues>({ defaultValues: defaults });

  const load = async () => {
    const [productRes, categoryRes, brandRes] = await Promise.all([
      api.get("/admin/products"),
      api.get("/admin/categories"),
      api.get("/admin/brands")
    ]);
    setProducts(productRes.data);
    setCategories(categoryRes.data);
    setBrands(brandRes.data);
  };

  useEffect(() => {
    load().catch(() => notify("Load failed", "Could not fetch product catalog.")).finally(() => setLoading(false));
  }, []);

  const activeImageUrl = watch("image_url");

  const beginEdit = (product: Product) => {
    setEditing(product);
    const image = product.images?.find((item) => item.is_primary)?.url || product.images?.[0]?.url || "";
    reset({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      specifications: product.specifications || "",
      tags: product.tags || "",
      price: String(product.price),
      compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
      stock: String(product.stock),
      category_id: product.category?.id ? String(product.category.id) : "",
      brand_id: product.brand?.id ? String(product.brand.id) : "",
      seo_title: product.seo_title || "",
      seo_description: product.seo_description || "",
      image_url: image,
      is_featured: product.is_featured,
      is_best_seller: product.is_best_seller,
      is_new_arrival: product.is_new_arrival,
      is_deal: product.is_deal,
      is_active: product.is_active
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    reset(defaults);
  };

  const submit = async (values: ProductFormValues) => {
    setBusy(true);
    try {
      const payload = normalize(values);
      const url = editing ? `/catalog/products/${editing.id}` : "/catalog/products";
      const method = editing ? "put" : "post";
      const productResponse = await api.request({ method, url, data: payload });
      const product: Product = productResponse.data;
      const imageUrl = values.image_url.trim();
      if (imageUrl) {
        const primary = product.images?.find((item) => item.is_primary) || product.images?.[0];
        if (primary) {
          await api.put(`/admin/product-images/${primary.id}`, { url: imageUrl, is_primary: true, sort_order: 0 });
        } else {
          await api.post(`/admin/products/${product.id}/images`, { url: imageUrl, is_primary: true, sort_order: 0 });
        }
      }
      await load();
      cancelEdit();
      notify(editing ? "Product updated" : "Product created");
    } catch {
      notify("Save failed", "Please check the fields and try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/catalog/products/${deleteTarget.id}`);
      await load();
      notify("Product deleted");
      setDeleteTarget(null);
    } catch {
      notify("Delete failed", "The item could not be removed.");
    } finally {
      setDeleting(false);
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/admin/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      setValue("image_url", response.data.url, { shouldDirty: true });
      notify("Upload complete", "Image URL was attached to the form.");
    } catch {
      notify("Upload failed", "The selected file could not be uploaded.");
    } finally {
      setUploading(false);
    }
  };

  const metrics = useMemo(() => ({
    total: products.length,
    featured: products.filter((product) => product.is_featured).length,
    deals: products.filter((product) => product.is_deal).length,
    lowStock: products.filter((product) => product.stock < 10).length
  }), [products]);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) => [product.name, product.sku, product.category?.name, product.brand?.name].some((value) => String(value || "").toLowerCase().includes(normalized)));
  }, [products, query]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metricDefinitions.map((definition) => {
          const Icon = definition.icon;
          return (
            <article key={definition.key} className="rounded-2xl border border-[color:var(--admin-line)] bg-[color:var(--admin-surface)] p-4 shadow-[0_10px_35px_rgba(16,18,15,0.045)]">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-[color:var(--admin-muted)]">{definition.label}</p><Icon size={16} className="text-[color:var(--admin-accent)]" /></div>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-[color:var(--admin-ink)]">{metrics[definition.key]}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <AdminPanel
          title="Product catalog"
          description="Search, review, and maintain every item in the store."
          action={
            <div className="flex w-full gap-2 sm:w-auto">
              <label className="relative min-w-0 flex-1 sm:w-56"><span className="sr-only">Search products</span><Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--admin-muted)]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search catalog" className="h-10 w-full rounded-xl border border-[color:var(--admin-line)] bg-white pl-9 pr-3 text-sm outline-none transition focus:border-[color:var(--admin-accent)]" /></label>
              <button type="button" onClick={() => load()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[color:var(--admin-line)] bg-white text-[color:var(--admin-muted)] transition hover:border-[color:var(--admin-accent)] hover:text-[color:var(--admin-accent)]" aria-label="Refresh products" title="Refresh products"><RefreshCw size={15} /></button>
            </div>
          }
        >
          {loading ? <div className="h-[30rem] animate-pulse bg-black/[0.04]" /> : filteredProducts.length ? (
            <div className="divide-y divide-[color:var(--admin-line)]">
              {filteredProducts.map((product) => (
                <article key={product.id} className="grid gap-4 px-5 py-4 transition hover:bg-black/[0.018] md:grid-cols-[64px_minmax(0,1fr)_auto] md:items-center md:px-6">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-[color:var(--admin-line)] bg-white">
                    <AssetImage src={product.images?.find((item) => item.is_primary)?.url || product.images?.[0]?.url} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-[color:var(--admin-ink)]">{product.name}</p>{product.is_active ? <AdminStatus label="Active" tone="success" /> : <AdminStatus label="Draft" />}{product.is_deal ? <AdminStatus label="Offer" tone="warning" /> : null}</div>
                    <p className="mt-1 line-clamp-1 text-xs leading-5 text-[color:var(--admin-muted)]">{product.description}</p>
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[color:var(--admin-muted)]"><span className="font-semibold text-[color:var(--admin-ink)]">{formatCurrency(product.price)}</span><span>SKU {product.sku}</span><span>{product.stock} in stock</span><span>{product.category?.name || "Unassigned"}</span></div>
                  </div>
                  <div className="flex items-center gap-1 md:justify-end">
                    <button type="button" onClick={() => beginEdit(product)} className="flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold text-[color:var(--admin-muted)] transition hover:bg-[color:var(--admin-accent-soft)] hover:text-[color:var(--admin-accent)]"><Pencil size={14} /> Edit</button>
                    <button type="button" onClick={() => setDeleteTarget(product)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--admin-muted)] transition hover:bg-red-50 hover:text-[color:var(--admin-danger)]" aria-label={`Delete ${product.name}`}><Trash2 size={15} /></button>
                  </div>
                </article>
              ))}
            </div>
          ) : <AdminEmptyState title={products.length ? "No matching products" : "No products yet"} description={products.length ? "Try a different product name, SKU, category, or brand." : "Create the first product using the catalog form."} />}
        </AdminPanel>

        <AdminPanel title={editing ? "Edit product" : "Create product"} description={editing ? `Updating ${editing.name}` : "Add a complete, storefront-ready catalog item."} className="h-fit 2xl:self-start">
          <form onSubmit={handleSubmit(submit)} className="space-y-6 p-5 sm:p-6">
            <fieldset className="space-y-4"><legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--admin-muted)]">Basic information</legend>
              <AdminField label="Product name"><Input placeholder="Product name" {...register("name", { required: true })} /></AdminField>
              <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-1"><AdminField label="URL slug"><Input placeholder="product-name" {...register("slug", { required: true })} /></AdminField><AdminField label="SKU"><Input placeholder="SKU-001" {...register("sku", { required: true })} /></AdminField></div>
              <AdminField label="Description"><Textarea placeholder="Customer-facing product description" {...register("description", { required: true })} /></AdminField>
              <AdminField label="Specifications"><Textarea placeholder="Materials, dimensions, technical details…" {...register("specifications")} /></AdminField>
              <AdminField label="Search tags"><Input placeholder="Comma-separated tags" {...register("tags")} /></AdminField>
            </fieldset>

            <fieldset className="space-y-4 border-t border-[color:var(--admin-line)] pt-5"><legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--admin-muted)]">Pricing & inventory</legend>
              <div className="grid grid-cols-2 gap-3"><AdminField label="Price"><Input type="number" step="0.01" placeholder="0.00" {...register("price", { required: true })} /></AdminField><AdminField label="Compare at"><Input type="number" step="0.01" placeholder="Optional" {...register("compare_at_price")} /></AdminField></div>
              <div className="grid grid-cols-2 gap-3"><AdminField label="Stock"><Input type="number" step="1" placeholder="0" {...register("stock", { required: true })} /></AdminField><AdminField label="Category"><Select {...register("category_id")}><option value="">Unassigned</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</Select></AdminField></div>
              <AdminField label="Brand"><Select {...register("brand_id")}><option value="">No brand</option>{brands.map((brand) => <option value={brand.id} key={brand.id}>{brand.name}</option>)}</Select></AdminField>
            </fieldset>

            <fieldset className="space-y-4 border-t border-[color:var(--admin-line)] pt-5"><legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--admin-muted)]">Product image</legend>
              <div className="rounded-xl border border-dashed border-[color:var(--admin-line)] bg-black/[0.018] p-4">
                <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--admin-ink)]"><ImageIcon size={16} className="text-[color:var(--admin-accent)]" /> Primary image</div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[color:var(--admin-line)] bg-white px-3 py-2 text-xs font-semibold text-[color:var(--admin-ink)] transition hover:border-[color:var(--admin-accent)]"><Upload size={14} /> {uploading ? "Uploading…" : "Upload"}<input type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.avif,.bmp,.svg,.ico,.tif,.tiff" className="hidden" disabled={uploading} onChange={(event) => event.target.files?.[0] && uploadImage(event.target.files[0])} /></label></div>
                <Input className="mt-3" placeholder="https://…" {...register("image_url")} />
                {activeImageUrl ? <div className="mt-3 flex items-center gap-3 rounded-xl border border-[color:var(--admin-line)] bg-white p-3"><div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-black/[0.04]"><AssetImage src={activeImageUrl} alt="Selected product" fill className="object-cover" /></div><div className="min-w-0"><p className="text-xs font-semibold text-[color:var(--admin-ink)]">Image preview</p><p className="mt-1 truncate text-xs text-[color:var(--admin-muted)]">{activeImageUrl}</p></div></div> : null}
              </div>
            </fieldset>

            <fieldset className="space-y-4 border-t border-[color:var(--admin-line)] pt-5"><legend className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--admin-muted)]">Search & placement</legend>
              <AdminField label="SEO title"><Input placeholder="Search result title" {...register("seo_title")} /></AdminField>
              <AdminField label="SEO description"><Textarea placeholder="Search result description" {...register("seo_description")} /></AdminField>
              <div className="grid grid-cols-2 gap-2">{[
                ["is_featured", "Featured"], ["is_best_seller", "Best seller"], ["is_new_arrival", "New arrival"], ["is_deal", "Offer"]
              ].map(([field, label]) => <label key={field} className="flex items-center gap-2 rounded-xl border border-[color:var(--admin-line)] bg-black/[0.018] px-3 py-3 text-xs font-semibold text-[color:var(--admin-ink)]"><input type="checkbox" className="h-4 w-4 accent-[color:var(--admin-accent)]" {...register(field as keyof ProductFormValues)} /> {label}</label>)}</div>
              <label className="flex items-start gap-3 rounded-xl border border-[color:var(--admin-line)] bg-[color:var(--admin-accent-soft)] p-3.5"><input type="checkbox" className="mt-0.5 h-4 w-4 accent-[color:var(--admin-accent)]" {...register("is_active")} /><span><span className="block text-sm font-semibold text-[color:var(--admin-ink)]">Active in storefront</span><span className="mt-0.5 block text-xs text-[color:var(--admin-muted)]">Customers can discover and purchase this product.</span></span></label>
            </fieldset>

            <div className="flex gap-2 border-t border-[color:var(--admin-line)] pt-5">
              <button type="submit" disabled={busy || isSubmitting} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[color:var(--admin-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-accent-dark)] disabled:opacity-55"><Plus size={16} /> {busy ? "Saving…" : editing ? "Update product" : "Create product"}</button>
              {editing ? <button type="button" onClick={cancelEdit} className="rounded-xl border border-[color:var(--admin-line)] px-4 py-3 text-sm font-semibold text-[color:var(--admin-ink)] transition hover:border-[color:var(--admin-ink)]">Cancel</button> : null}
            </div>
          </form>
        </AdminPanel>
      </div>

      <AdminConfirmDialog open={Boolean(deleteTarget)} title="Delete product?" description={`“${deleteTarget?.name || "This product"}” will be permanently removed from the catalog.`} busy={deleting} onConfirm={remove} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
}
