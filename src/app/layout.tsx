import type { Metadata } from "next";
import { siteConfig } from "@/config/site.config";
import { fontSans, fontSerif } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} (${siteConfig.shortName})`,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en",
  },
  // No image is set anywhere, so a shared link renders as a text card rather
  // than a broken one. `summary` is the honest card type for that; upgrading
  // to `summary_large_image` needs an actual OG image first.
  twitter: {
    card: "summary",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  // The default for public pages. The portal and auth layouts override this
  // with `noindex` — see the note in each.
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(fontSans.variable, fontSerif.variable)}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
