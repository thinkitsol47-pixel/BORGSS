import localFont from "next/font/local";

/**
 * Self-hosted variable fonts — no network fetch at build time, so offline
 * builds keep working. Files live in /public/fonts.
 *
 * Inter          — UI, navigation, body copy.
 * Source Serif 4 — journal masthead, headings, article text.
 */

export const fontSans = localFont({
  src: [
    {
      path: "../../public/fonts/inter-latin.woff2",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter-latin-ext.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "Arial", "sans-serif"],
});

export const fontSerif = localFont({
  src: [
    {
      path: "../../public/fonts/source-serif-latin.woff2",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../../public/fonts/source-serif-latin-ext.woff2",
      weight: "400 700",
      style: "normal",
    },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "serif"],
});
