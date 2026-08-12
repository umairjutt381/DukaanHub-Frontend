"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const stored = localStorage.getItem("dukaanhub-theme");
    const isDark = stored ? stored === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("dukaanhub-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  };
  return (
    <button onClick={toggle} className="rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:border-brand-500 hover:text-brand-700" aria-label="Toggle theme">
      {dark ? <SunMedium size={18} /> : <MoonStar size={18} />}
    </button>
  );
}
