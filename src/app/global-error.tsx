"use client";

import { fontSans, fontSerif } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

/**
 * Last-resort boundary: catches errors thrown in the root layout itself,
 * where the normal error.tsx cannot render. It replaces the root layout,
 * so it must supply its own <html>, <body>, fonts and stylesheet — hence
 * the repeated font wiring here.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className={cn(fontSans.variable, fontSerif.variable)}>
      <body className="grid min-h-dvh place-items-center bg-background p-8 text-center font-sans text-foreground">
        <div className="max-w-md">
          <p className="font-serif text-3xl font-semibold">
            Something went wrong
          </p>
          <p className="mt-3 text-muted-foreground">
            An unexpected error occurred while loading this page.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              Reference: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            className="mt-7 inline-flex h-10 items-center justify-center rounded-lg bg-brand px-4.5 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand-dark"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
