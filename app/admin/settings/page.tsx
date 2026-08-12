"use client";

import { useEffect, useState } from "react";
import { Plus, Save, SlidersHorizontal } from "lucide-react";

import { api } from "@/lib/api/client";
import { AdminEmptyState, AdminField, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function AdminSettingsPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const res = await api.get("/admin/settings");
    setItems(res.data);
    setDrafts(Object.fromEntries(res.data.map((item: any) => [item.key, item.value])));
  };

  useEffect(() => {
    load().catch(() => notify("Load failed", "Website settings could not be loaded.")).finally(() => setLoading(false));
  }, []);

  const save = async (key: string, value: string) => {
    try {
      setBusy(key);
      await api.put("/admin/settings", { key, value });
      await load();
      notify("Setting saved");
    } catch {
      notify("Save failed", "Could not update website setting.");
    } finally {
      setBusy(null);
    }
  };

  const createSetting = async () => {
    if (!newKey.trim()) return;
    await save(newKey.trim(), newValue);
    setNewKey("");
    setNewValue("");
  };

  return (
    <AdminShell title="Settings">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <AdminPanel title="Store configuration" description="Operational values currently used by the website.">
          {loading ? <div className="h-80 animate-pulse bg-black/[0.04]" /> : items.length ? (
            <div className="divide-y divide-[color:var(--admin-line)]">
              {items.map((item) => {
                const unchanged = (drafts[item.key] ?? "") === String(item.value ?? "");
                return (
                  <div key={item.key} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(150px,0.65fr)_minmax(0,1fr)_auto] md:items-end md:px-6">
                    <div className="flex min-w-0 items-center gap-3 md:self-center"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color:var(--admin-accent-soft)] text-[color:var(--admin-accent)]"><SlidersHorizontal size={15} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[color:var(--admin-ink)]">{item.key}</p><p className="mt-0.5 text-xs text-[color:var(--admin-muted)]">Configuration key</p></div></div>
                    <AdminField label="Value"><Input value={drafts[item.key] ?? ""} onChange={(event) => setDrafts((current) => ({ ...current, [item.key]: event.target.value }))} /></AdminField>
                    <button type="button" onClick={() => save(item.key, drafts[item.key] ?? item.value)} disabled={busy === item.key || unchanged} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[color:var(--admin-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-accent-dark)] disabled:cursor-not-allowed disabled:bg-black/10 disabled:text-[color:var(--admin-muted)]"><Save size={15} /> {busy === item.key ? "Saving…" : "Save"}</button>
                  </div>
                );
              })}
            </div>
          ) : <AdminEmptyState title="No settings configured" description="Add the first key-value setting to start configuring the storefront." />}
        </AdminPanel>

        <AdminPanel title="Add configuration" description="Create a new key-value pair for store operations." className="h-fit xl:sticky xl:top-7">
          <div className="space-y-4 p-5 sm:p-6">
            <AdminField label="Setting key" hint="Use a stable, descriptive key."><Input placeholder="store_support_email" value={newKey} onChange={(event) => setNewKey(event.target.value)} /></AdminField>
            <AdminField label="Setting value"><Input placeholder="Value" value={newValue} onChange={(event) => setNewValue(event.target.value)} /></AdminField>
            <button type="button" onClick={createSetting} disabled={!newKey.trim() || busy === newKey.trim()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--admin-accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--admin-accent-dark)] disabled:opacity-55"><Plus size={16} /> {busy === newKey.trim() ? "Saving…" : "Save setting"}</button>
          </div>
        </AdminPanel>
      </div>
    </AdminShell>
  );
}
