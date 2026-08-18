import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

const popular = [
  ["Electronics", "/category/electronics"],
  ["Fashion", "/category/fashion"],
  ["Home & Living", "/category/home-living"],
  ["Groceries", "/category/groceries"],
  ["Beauty & Personal Care", "/category/beauty-personal-care"],
  ["Sports & Outdoors", "/category/sports-outdoors"],
] as const;

const service = [
  ["About Us", "/about"],
  ["Terms & Conditions", "/terms-conditions"],
  ["FAQ", "/faqs"],
  ["Privacy Policy", "/privacy-policy"],
  ["Return Policy", "/return-policy"],
  ["Contact Us", "/contact"],
] as const;

function FooterColumn({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-bold uppercase tracking-[.12em] text-white">{title}</h2>
      <ul className="mt-5 space-y-2.5">
        {links.map(([label, href]) => <li key={label}><Link href={href} className="text-xs text-white/55 transition hover:text-[#00acac]">› &nbsp;{label}</Link></li>)}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-0 border-t-2 border-[#00acac] bg-[#242a30] text-white">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-14">
        <section>
          <Link href="/" className="text-2xl font-semibold text-white"><span className="text-[#00acac]">Dukaan</span>Hub</Link>
          <p className="mt-5 max-w-xs text-xs leading-6 text-white/55">Trusted products, useful details and straightforward shopping for customers across Pakistan.</p>
        </section>
        <FooterColumn title="Most Popular Categories" links={popular} />
        <FooterColumn title="Customer Services" links={service} />
        <section><h2 className="text-xs font-bold uppercase tracking-[.12em]">Our contact</h2><div className="mt-5 space-y-4 text-xs text-white/55"><p className="flex gap-3"><MapPin size={15} className="shrink-0 text-[#00acac]" /> Pakistan</p><p className="flex gap-3"><Phone size={15} className="shrink-0 text-[#00acac]" /> +92 300 0000000</p><p className="flex gap-3"><Mail size={15} className="shrink-0 text-[#00acac]" /> support@dukaanhub.com</p></div></section>
      </div>
      <div className="border-t border-white/10 bg-[#1d2226]"><div className="container-page py-4 text-center text-[10px] text-white/45">© {new Date().getFullYear()} DukaanHub. All rights reserved.</div></div>
    </footer>
  );
}
