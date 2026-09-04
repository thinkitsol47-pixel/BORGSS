"use client";

import { RotateCw, Upload } from "lucide-react";
import { Button } from "@/components/ui";
import type { DepositState } from "@/types";

/**
 * Depositing DOIs with Crossref, and retrying what failed.
 *
 * Both controls are **disabled while the journal has no prefix**, with the
 * reason on the button itself rather than in a paragraph further down. Every
 * DOI in the register begins `10.xxxxx`, which no registry issues; a deposit
 * button that looked ready would invite an editor to press it and then wonder
 * why nothing resolved.
 *
 * UI ONLY. Nothing talks to Crossref.
 */

export function DepositAllButton({ hasPrefix }: { hasPrefix: boolean }) {
  return (
    <Button
      disabled={!hasPrefix}
      title={
        hasPrefix
          ? undefined
          : "The journal has no Crossref prefix, so nothing can be deposited"
      }
      onClick={() =>
        alert(
          "Nothing was deposited — this screen does not talk to Crossref yet.",
        )
      }
    >
      <Upload className="size-4" aria-hidden />
      {hasPrefix ? "Deposit outstanding" : "Deposit — no prefix yet"}
    </Button>
  );
}

/**
 * The per-row control.
 *
 * What it offers depends on the row's state, because "Retry" on a registered
 * DOI and "Deposit" on a failed one are different operations and offering the
 * wrong one is how a working deposit gets overwritten.
 */
export function DepositRowAction({
  state,
  doi,
  hasPrefix,
}: {
  state: DepositState;
  doi: string;
  hasPrefix: boolean;
}) {
  // A registered DOI needs nothing. Re-depositing it is a metadata update,
  // which is its own operation and not this button.
  if (state === "registered") return null;

  // Pending means Crossref has it and has not answered. Another attempt while
  // one is in flight is how duplicates are created.
  if (state === "pending") {
    return (
      <span className="text-xs text-muted-foreground">Awaiting Crossref</span>
    );
  }

  const isRetry = state === "failed";

  return (
    <button
      type="button"
      disabled={!hasPrefix}
      title={hasPrefix ? undefined : "No Crossref prefix"}
      onClick={() =>
        alert(
          `Nothing happened — this screen does not talk to Crossref yet.\n\n${doi} would be ${isRetry ? "retried" : "deposited"}.`,
        )
      }
      className="inline-flex items-center gap-1 rounded-lg border border-brand-border px-2 py-1 text-xs font-medium text-primary transition-colors hover:border-brand hover:bg-brand-tint/50 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
    >
      {isRetry ? (
        <>
          <RotateCw className="size-3" aria-hidden />
          Retry
        </>
      ) : (
        <>
          <Upload className="size-3" aria-hidden />
          Deposit
        </>
      )}
      <span className="sr-only"> {doi}</span>
    </button>
  );
}
