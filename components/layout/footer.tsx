import Link from "next/link";
import { Apple, Download, Phone, Smartphone } from "lucide-react";

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
      <h2 className="relative inline-block pb-2.5 text-sm font-semibold text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-8 after:bg-white">{title}</h2>
      <ul className="mt-4 space-y-2">
        {links.map(([label, href]) => <li key={label}><Link href={href} className="text-[11px] text-white/90 transition hover:text-white">• {label}</Link></li>)}
      </ul>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="mt-0 bg-[#212844] text-white">
      <div className="container-page grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] lg:py-12">
        <section>
          <Link href="/" className="font-[Poppins] text-2xl font-bold text-white">DukaanHub</Link>
          <h2 className="mt-5 text-xs font-semibold text-white">Contact Us</h2>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-white/90"><Smartphone size={14} /> WhatsApp<br />+92 300 0000000</p>
          <p className="mt-3 flex items-center gap-2 text-[11px] text-white/90"><Phone size={14} /> Call Us<br />+92 300 0000000</p>
          <h2 className="mt-5 text-xs font-semibold text-white">Download App</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 text-[8px] leading-tight"><Apple size={17} className="fill-white" /><span>Download on the<strong className="block text-[11px]">App Store</strong></span></span>
            <span className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 text-[8px] leading-tight"><Download size={17} /><span>GET IT ON<strong className="block text-[11px]">Google Play</strong></span></span>
          </div>
        </section>
        <FooterColumn title="Most Popular Categories" links={popular} />
        <FooterColumn title="Customer Services" links={service} />
      </div>
      <div className="container-page border-t border-white/15 py-4 text-center text-[10px] text-white/90">© {new Date().getFullYear()} DukaanHub. All rights reserved.</div>
    </footer>
  );
}
