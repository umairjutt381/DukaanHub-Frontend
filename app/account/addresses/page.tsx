"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Home, MapPin, Navigation, Phone, Plus, ShoppingBag } from "lucide-react";

import { AccountCount, AccountShell } from "@/components/account/account-shell";
import { AccountEmptyState, AccountErrorState, AccountPageSkeleton } from "@/components/account/account-states";
import type { AccountAddress } from "@/components/account/types";
import { getRequestStatus, useAccountSession } from "@/components/account/use-account-session";
import { api } from "@/lib/api/client";

function AddressCard({ address, featured = false }: { address: AccountAddress; featured?: boolean }) {
  const street = address.line1 || address.address_line1;
  const locality = [address.city, address.state, address.postal_code].filter(Boolean).join(", ");

  return (
    <article className={`relative overflow-hidden rounded-[var(--radius-lg)] p-5 sm:p-6 ${featured ? "bg-[color:var(--ink)] text-white shadow-[var(--shadow)]" : "bg-white text-[color:var(--ink)] shadow-[var(--shadow-xs)] ring-1 ring-black/[0.055]"}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-full ${featured ? "bg-white/10 text-emerald-400" : "bg-[color:var(--canvas-deep)] text-[color:var(--ink)]"}`}>
          {featured ? <Navigation size={18} aria-hidden="true" /> : <Home size={18} aria-hidden="true" />}
        </span>
        {address.is_default ? (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] ${featured ? "bg-white/10 text-white/75" : "bg-[color:var(--accent-wash)] text-[color:var(--accent-dark)]"}`}>
            <Check size={12} aria-hidden="true" /> Default
          </span>
        ) : null}
      </div>

      <h2 className="mt-6 text-lg font-semibold tracking-[-0.025em]">{address.label || "Delivery address"}</h2>
      {address.full_name ? <p className={`mt-4 text-sm font-medium ${featured ? "text-white/85" : "text-[color:var(--ink-soft)]"}`}>{address.full_name}</p> : null}
      <address className={`mt-1 min-h-[72px] not-italic text-sm leading-6 ${featured ? "text-white/55" : "text-[color:var(--muted)]"}`}>
        {street ? <span className="block">{street}</span> : null}
        {address.line2 ? <span className="block">{address.line2}</span> : null}
        {locality ? <span className="block">{locality}</span> : null}
        {address.country ? <span className="block">{address.country}</span> : null}
      </address>
      {address.phone ? (
        <p className={`mt-5 flex items-center gap-2 border-t pt-4 text-sm ${featured ? "border-white/10 text-white/55" : "border-[color:var(--line)] text-[color:var(--muted)]"}`}>
          <Phone size={15} aria-hidden="true" /> {address.phone}
        </p>
      ) : null}
    </article>
  );
}

export default function AccountAddressesPage() {
  const { ready, user, signOut, handleUnauthorized } = useAccountSession();
  const [items, setItems] = useState<AccountAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ label: "Delivery address", full_name: "", phone: "", line1: "", city: "", postal_code: "", country: "Pakistan" });

  const loadAddresses = useCallback(async () => {
    if (!ready) return;
    setLoading(true);
    setError(false);
    try {
      const response = await api.get<AccountAddress[]>("/addresses");
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

  const saveAddress = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await api.post("/addresses", { ...form, is_default: items.length === 0 });
      setForm({ label: "Delivery address", full_name: "", phone: "", line1: "", city: "", postal_code: "", country: "Pakistan" });
      setShowForm(false);
      await loadAddresses();
    } catch (requestError) {
      if (getRequestStatus(requestError) === 401) handleUnauthorized();
      else setError(true);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const orderedAddresses = useMemo(() => [...items].sort((a, b) => Number(b.is_default) - Number(a.is_default)), [items]);

  return (
    <AccountShell
      title="Delivery addresses"
      description="The places you’ve saved for faster, more accurate checkout."
      user={user}
      onSignOut={signOut}
      meta={!loading && !error ? <AccountCount>{items.length} saved</AccountCount> : undefined}
    >
      {loading || !ready ? <AccountPageSkeleton variant="grid" /> : null}
      {!loading && error ? <AccountErrorState onRetry={() => void loadAddresses()} /> : null}

      {!loading && !error && orderedAddresses.length ? (
        <>
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-xs leading-5 text-[color:var(--muted)]">New addresses are saved securely when you use them during checkout.</p>
            <button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-[color:var(--accent)] px-3.5 text-xs font-semibold text-white transition hover:bg-[color:var(--accent-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]"><Plus size={15} /> Add another address</button>
          </div>
          {showForm ? (
            <form onSubmit={saveAddress} className="mb-6 grid gap-4 rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] p-5 sm:grid-cols-2 sm:p-6">
              <input required placeholder="Label (e.g. Home)" value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })} className="min-h-11 rounded-xl border-0 bg-white px-3 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[color:var(--accent)]" />
              <input required placeholder="Full name" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="min-h-11 rounded-xl border-0 bg-white px-3 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[color:var(--accent)]" />
              <input required placeholder="Phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="min-h-11 rounded-xl border-0 bg-white px-3 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[color:var(--accent)]" />
              <input required placeholder="House, street and area" value={form.line1} onChange={(event) => setForm({ ...form, line1: event.target.value })} className="min-h-11 rounded-xl border-0 bg-white px-3 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[color:var(--accent)] sm:col-span-2" />
              <input required placeholder="City" value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} className="min-h-11 rounded-xl border-0 bg-white px-3 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[color:var(--accent)]" />
              <input required placeholder="Postal code" value={form.postal_code} onChange={(event) => setForm({ ...form, postal_code: event.target.value })} className="min-h-11 rounded-xl border-0 bg-white px-3 text-sm outline-none ring-1 ring-black/[0.06] focus:ring-2 focus:ring-[color:var(--accent)]" />
              <div className="flex gap-3 sm:col-span-2"><button type="submit" disabled={saving} className="min-h-11 rounded-xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save address"}</button><button type="button" onClick={() => setShowForm(false)} className="min-h-11 rounded-xl bg-white px-4 text-sm font-semibold text-[color:var(--ink)] ring-1 ring-black/[0.06]">Cancel</button></div>
            </form>
          ) : null}
          <div className="grid gap-5 md:grid-cols-2">
            {orderedAddresses.map((address, index) => <AddressCard key={address.id} address={address} featured={index === 0 && address.is_default} />)}
          </div>
        </>
      ) : null}

      {!loading && !error && !items.length ? (
        <AccountEmptyState
          icon={MapPin}
          title="No delivery addresses yet"
          description="Complete a checkout and your delivery address will be ready here when you return."
          href="/products"
          action="Start shopping"
        />
      ) : null}

      {!loading && !error && items.length ? (
        <div className="mt-6 flex items-start gap-3 rounded-[var(--radius-lg)] bg-[color:var(--canvas-deep)] px-5 py-4 text-xs leading-5 text-[color:var(--muted)]">
          <ShoppingBag size={16} className="mt-0.5 shrink-0 text-[color:var(--accent)]" aria-hidden="true" />
          Delivery details are connected to your customer account and used to make future checkouts quicker.
        </div>
      ) : null}
    </AccountShell>
  );
}
