import type { Config } from "tailwindcss";

const config: Config = {
  // No dark mode: the journal is a single light, white-ground identity.
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      screens: {
        // Small phones (360–414px) need a step below Tailwind's 640px `sm`,
        // where a side-by-side layout stops fitting.
        xs: "420px",
      },
      colors: {
        // semantic tokens -> CSS variables in globals.css
        border: {
          DEFAULT: "hsl(var(--border))",
          strong: "hsl(var(--border-strong))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        /* Bright sky — surfaces, fills, large text. Not small text on white. */
        brand: {
          DEFAULT: "hsl(var(--brand))",
          foreground: "hsl(var(--brand-foreground))",
          dark: "hsl(var(--brand-dark))",
          darker: "hsl(var(--brand-darker))",
          tint: "hsl(var(--brand-tint))",
          border: "hsl(var(--brand-border))",
        },
        /* Accessible sky — links and small text on white. */
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      fontSize: {
        // Display sizes for hero + section headings.
        "display-sm": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.022em" }],
        "display-lg": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
      },
      spacing: {
        "4.5": "1.125rem",
      },
      maxWidth: {
        prose: "44rem", // article body reading width
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Very soft — depth on a white page comes from hairlines, not heavy shade.
        card: "0 1px 2px hsl(215 25% 27% / 0.04), 0 1px 3px hsl(215 25% 27% / 0.06)",
        "card-hover":
          "0 2px 4px hsl(215 25% 27% / 0.05), 0 8px 20px hsl(215 25% 27% / 0.08)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(0.5rem)" },
          to: { opacity: "1", transform: "none" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        "fade-in": "fade-in 0.25s ease-out both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
