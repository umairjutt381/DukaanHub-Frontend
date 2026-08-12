"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, Heart, LogIn, LogOut, Package, Settings, ShoppingBag, UserRound } from "lucide-react";

import { BrandLogo } from "@/components/layout/brand-logo";
import { HeaderSearch } from "@/components/layout/header-search";
import { clearStoredSession, getStoredToken, useAuthStore } from "@/lib/store/auth";
import { mergedCartItemCount, useCartStore } from "@/lib/store/cart";
import { useWishlistStore } from "@/lib/store/wishlist";
import { api } from "@/lib/api/client";
import { authHref } from "@/lib/auth-return";

const navigation = [
  ["Groceries", "/category/groceries"],
  ["Premium Fruits", "/products?q=fruits"],
  ["Home & Kitchen", "/category/home-living"],
  ["Fashion", "/category/fashion"],
  ["Electronics", "/category/electronics"],
  ["Beauty", "/category/beauty-personal-care"],
  ["Home Improvement", "/products?q=home"],
  ["Sports & Outdoors", "/category/sports-outdoors"]
] as const;

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(true);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [headerFocused, setHeaderFocused] = useState(false);
  const hydrate = useAuthStore((state) => state.hydrate);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const localCartItems = useCartStore((state) => state.items);
  const remoteCartItems = useCartStore((state) => state.remoteItems);
  const setRemoteCartItems = useCartStore((state) => state.setRemoteItems);
  const hydrateWishlist = useWishlistStore((state) => state.hydrate);
  const interactionOpen = accountOpen || desktopSearchOpen || mobileSearchOpen || headerFocused;

  const loadRemoteCart = useCallback(async () => {
    if (!getStoredToken()) {
      setRemoteCartItems([]);
      return;
    }
    try {
      const response = await api.get("/cart");
      setRemoteCartItems((response.data?.items || []).map((item: { product_id: number; quantity: number }) => ({ product_id: item.product_id, quantity: item.quantity })));
    } catch {
      setRemoteCartItems([]);
    }
  }, [setRemoteCartItems]);

  const cartCount = useMemo(() => mergedCartItemCount(localCartItems, remoteCartItems), [localCartItems, remoteCartItems]);

  useEffect(() => hydrate(), [hydrate]);
  useEffect(() => {
    void hydrateWishlist();
  }, [hydrateWishlist, user?.id]);
  useEffect(() => {
    void loadRemoteCart();
    const refresh = () => void loadRemoteCart();
    window.addEventListener("dukaanhub:cart-changed", refresh);
    return () => window.removeEventListener("dukaanhub:cart-changed", refresh);
  }, [loadRemoteCart, user?.id]);

  useEffect(() => {
    setAccountOpen(false);
    setHeaderVisible(true);
    lastScrollYRef.current = window.scrollY;
  }, [pathname]);

  useEffect(() => {
    if (interactionOpen) setHeaderVisible(true);
  }, [interactionOpen]);

  useEffect(() => {
    const showHeader = () => setHeaderVisible(true);
    window.addEventListener("dukaanhub:show-header", showHeader);
    return () => window.removeEventListener("dukaanhub:show-header", showHeader);
  }, []);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const handleFocusIn = () => {
      setHeaderFocused(true);
      setHeaderVisible(true);
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (!header.contains(event.relatedTarget as Node | null)) setHeaderFocused(false);
    };
    header.addEventListener("focusin", handleFocusIn);
    header.addEventListener("focusout", handleFocusOut);
    return () => {
      header.removeEventListener("focusin", handleFocusIn);
      header.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.headerVisible = headerVisible ? "true" : "false";
    return () => {
      delete document.documentElement.dataset.headerVisible;
    };
  }, [headerVisible]);

  useEffect(() => {
    let animationFrame: number | null = null;
    lastScrollYRef.current = window.scrollY;

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const delta = currentScrollY - lastScrollYRef.current;
      const headerHeight = headerRef.current?.offsetHeight || 96;
      setScrolled(currentScrollY > 8);

      if (currentScrollY < headerHeight || interactionOpen) {
        setHeaderVisible(true);
      } else if (delta > 8) {
        setHeaderVisible(false);
      } else if (delta < -8) {
        setHeaderVisible(true);
      }

      if (Math.abs(delta) > 8 || currentScrollY < headerHeight) lastScrollYRef.current = currentScrollY;
      animationFrame = null;
    };
    const onScroll = () => {
      if (animationFrame === null) animationFrame = window.requestAnimationFrame(updateHeader);
    };
    const closeOnOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountOpen(false);
    };
    updateHeader();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [interactionOpen]);

  const signOut = () => {
    clearStoredSession();
    clearAuth();
    setAccountOpen(false);
    router.push("/");
  };

  const firstName = user?.full_name?.trim().split(" ")[0] || "Account";

  return (
    <>
      <div className="hidden border-b border-[color:var(--line)] bg-[#eef1f7] text-[color:var(--muted)] lg:block">
        <div className="container-page flex h-[34px] items-center justify-between text-[0.68rem]">
          <span>Welcome to DukaanHub</span>
          <div className="flex items-center gap-5 font-medium">
            <Link href="/track-order" className="transition hover:text-[color:var(--accent)]">Track your order</Link>
            <Link href="/deals" className="transition hover:text-[color:var(--accent)]">All offers</Link>
            <Link href={user ? "/account" : "/login"} className="transition hover:text-[color:var(--accent)]">{user ? "My account" : "Sign in"}</Link>
          </div>
        </div>
      </div>
    <header ref={headerRef} className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-xl will-change-transform transition-[transform,border-color,box-shadow] duration-300 ease-out focus-within:translate-y-0 motion-reduce:transition-none ${headerVisible ? "translate-y-0" : "-translate-y-full"} ${scrolled && headerVisible ? "border-[color:var(--line-dark)] shadow-[0_8px_24px_rgba(21,64,80,0.08)]" : "border-[color:var(--line)]"}`}>
      <div className="container-page hidden lg:block">
        <div className="grid h-[72px] grid-cols-[210px_minmax(360px,640px)_240px] items-center justify-between gap-7">
          <Link href="/" aria-label="DukaanHub home" className="w-fit rounded-xl outline-none transition focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-4">
            <BrandLogo />
          </Link>

          <div className="mx-auto w-full max-w-[720px]">
            <HeaderSearch onOpenChange={setDesktopSearchOpen} />
          </div>

          <div className="ml-auto flex items-center gap-5">
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((current) => !current)}
                aria-expanded={accountOpen}
                aria-controls="account-menu"
                className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-neutral-700 outline-none transition hover:bg-[#f3f5fa] hover:text-[#212844] focus-visible:ring-2 focus-visible:ring-[#212844] ${accountOpen || pathname.startsWith("/account") ? "text-[#212844]" : ""}`}
              >
                <span className="flex items-center gap-1 text-[#212844]"><UserRound size={19} className="transition-transform duration-200 group-hover:scale-105" /><ChevronDown size={12} className={`transition ${accountOpen ? "rotate-180" : ""}`} /></span>
                <span className="max-w-[90px] truncate">{user ? firstName : "Sign Up/Sign In"}</span>
              </button>

              {accountOpen ? (
                <div id="account-menu" className="absolute right-0 top-[calc(100%+12px)] z-[70] w-[284px] overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-2 shadow-[0_22px_64px_rgba(0,0,0,0.14)]">
                  {user ? (
                    <>
                      <div className="rounded-xl bg-neutral-50 p-3.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-xs font-bold text-white">{user.full_name?.trim().charAt(0).toUpperCase() || <UserRound size={17} />}</span>
                          <span className="min-w-0"><span className="block truncate text-sm font-bold text-neutral-950">{user.full_name}</span><span className="mt-0.5 block truncate text-xs text-neutral-500">{user.email}</span></span>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <Link href={user.role === "admin" ? "/admin" : "/account"} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950">
                          {user.role === "admin" ? <Settings size={17} /> : <UserRound size={17} />}
                          {user.role === "admin" ? "Store administration" : "Account overview"}
                        </Link>
                        <Link href="/account/orders" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"><Package size={17} /> Orders & returns</Link>
                        <Link href="/wishlist" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 hover:text-neutral-950"><Heart size={17} /> Saved products</Link>
                        <div className="my-2 border-t border-neutral-100" />
                        <button type="button" onClick={signOut} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"><LogOut size={17} /> Sign out</button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2">
                      <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-800"><UserRound size={17} aria-hidden="true" /></span>
                        <div className="min-w-0 pt-0.5">
                          <p className="text-sm font-semibold tracking-[-0.01em] text-neutral-950">Your DukaanHub account</p>
                          <p className="mt-1 text-xs leading-5 text-neutral-500">See orders, saved items and delivery updates.</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <Link href={authHref("/login", pathname)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[color:var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)] focus-visible:ring-offset-2"><LogIn size={15} aria-hidden="true" /> Sign in</Link>
                        <Link href={authHref("/register", pathname)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-3 text-sm font-semibold text-neutral-800 transition hover:border-neutral-300 hover:bg-neutral-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2">Join <ArrowRight size={14} aria-hidden="true" /></Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <Link href="/cart" aria-label={`Cart with ${cartCount} ${cartCount === 1 ? "item" : "items"}`} className={`group flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#212844] ${isCurrentPath(pathname, "/cart") ? "text-[#212844]" : "text-neutral-700 hover:bg-[#f3f5fa] hover:text-[#212844]"}`}>
              <span className="relative text-[#212844]"><ShoppingBag size={19} className="transition-transform duration-200 group-hover:scale-105" />{cartCount ? <span className="absolute -right-2.5 -top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff7a45] px-1 text-[0.55rem] font-bold text-white ring-2 ring-white">{cartCount > 99 ? "99+" : cartCount}</span> : null}</span>
              <span>Cart</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden border-t border-[#e7e9f0] lg:block">
        <div className="container-page flex h-[50px] items-center">
          <nav className="flex h-full w-full items-center gap-1 overflow-x-auto [scrollbar-width:none]" aria-label="Primary navigation">
            {navigation.map(([label, href]) => {
              const active = isCurrentPath(pathname, href);
              return (
                <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex shrink-0 items-center rounded-full px-3 py-2 text-[12px] font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-[#212844] ${active || href === "/category/groceries" ? "bg-[#212844] text-white" : "text-[#454a5e] hover:bg-[#f1f4fa]"}`}>
                  {label}
                </Link>
              );
            })}
          </nav>

        </div>
      </div>

      <div className="container-page py-3 lg:hidden">
        <div className="flex h-11 items-center justify-between">
          <Link href="/" aria-label="DukaanHub home" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-neutral-950">
            <BrandLogo className="scale-[0.9] origin-left" />
          </Link>
          <div className="flex items-center gap-1">
            <Link href={user ? "/account" : "/login"} aria-label={user ? "Your account" : "Sign in"} className="flex h-11 w-11 items-center justify-center rounded-xl text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"><UserRound size={20} /></Link>
            <Link href="/cart" aria-label={`Cart with ${cartCount} ${cartCount === 1 ? "item" : "items"}`} className="relative flex h-11 w-11 items-center justify-center rounded-xl text-neutral-700 transition hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950">
              <ShoppingBag size={20} />
              {cartCount ? <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color:var(--accent)] px-1 text-[0.52rem] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</span> : null}
            </Link>
          </div>
        </div>
        <div className="mt-2"><HeaderSearch mobile onOpenChange={setMobileSearchOpen} /></div>
      </div>
    </header>
    </>
  );
}
