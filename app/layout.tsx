import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/layout/providers";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: {
    default: "DukaanHub",
    template: "%s | DukaanHub"
  },
  description: "Shop everyday essentials, new arrivals and trusted brands across Pakistan with DukaanHub.",
  icons: [{ rel: "icon", url: "/brand/dukaanhub-logo.png" }]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <PageShell>{children}</PageShell>
        </Providers>
      </body>
    </html>
  );
}
