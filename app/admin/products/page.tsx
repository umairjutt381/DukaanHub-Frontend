"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProductManager } from "@/components/admin/product-manager";

export default function AdminProductsPage() {
  return (
    <AdminShell title="Products">
      <ProductManager />
    </AdminShell>
  );
}
