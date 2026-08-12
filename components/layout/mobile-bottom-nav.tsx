"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Search, ShoppingBag, Store } from "lucide-react";

import { mergedCartItemCount, useCartStore } from "@/lib/store/cart";

const navigation = [
  { label: "Home", href: "/", icon: Home },
  { label: "Shop", href: "/products", icon: Store },
  { label: "Saved", href: "/wishlist", icon: Heart },
  { label: "Cart", href: "/cart", icon: ShoppingBag }
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const localCartItems = useCartStore((state) => state.items);
  const remoteCartItems = useCartStore((state) => state.remoteItems);
  const cartCount = mergedCartItemCount(localCartItems, remoteCartItems);

  if (pathname.startsWith("/product/") || pathname === "/checkout" || pathname.startsWith("/order-success") || pathname.startsWith("/order-failed")) return null;

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-[80] border-t border-neutral-200/80 bg-white/92 px-[max(12px,env(safe-area-inset-left))] pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-12px_35px_rgba(0,0,0,0.06)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 items-end">
        {navigation.slice(0, 2).map(({ label, href, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`) || (href === "/products" && (pathname.startsWith("/product/") || pathname.startsWith("/category/")));
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`relative flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl text-[0.63rem] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 ${active ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"}`}>
              <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
              <span>{label}</span>
              {active ? <span className="absolute bottom-0 h-1 w-1 rounded-full bg-[color:var(--accent)]" /> : null}
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => window.dispatchEvent(new Event("dukaanhub:focus-search"))}
          aria-label="Open product search"
          className="group relative -mt-5 flex min-h-[66px] flex-col items-center justify-end gap-1 rounded-xl pb-1 text-[0.63rem] font-semibold text-neutral-700 outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--accent)] text-white shadow-[0_8px_22px_rgba(33,40,68,0.28)] transition duration-200 group-active:scale-95"><Search size={20} /></span>
          <span>Search</span>
        </button>

        {navigation.slice(2).map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`relative flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-xl text-[0.63rem] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 ${active ? "text-neutral-950" : "text-neutral-500 hover:text-neutral-950"}`}>
              <span className="relative">
                <Icon size={20} strokeWidth={active ? 2.2 : 1.7} />
                {href === "/cart" && cartCount ? <span className="absolute -right-2.5 -top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[0.55rem] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</span> : null}
              </span>
              <span>{label}</span>
              {active ? <span className="absolute bottom-0 h-1 w-1 rounded-full bg-[color:var(--accent)]" /> : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
