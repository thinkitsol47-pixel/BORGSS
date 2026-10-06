"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { Globe } from "lucide-react";
import { Alert, Button, Checkbox } from "@/components/ui";
import {
  publishIssue,
  type PublishState,
} from "@/app/(dashboard)/editorial/issues/actions";
import type { PublishReadiness } from "@/lib/api/publishing";

const initialState: PublishState = { status: "idle" };

/**
 * The publish control on an issue's screen.
 *
 * Readiness is computed on the server and passed in, so what this panel says
 * is blocking is what `publishIssueRecord` will check again — the button is
 * offered only when nothing is. The confirmation is a checkbox the action
 * also requires, because publishing cannot be undone from the app.
 */
export function PublishIssue({
  issueId,
  readiness,
}: {
  issueId: string;
  readiness: PublishReadiness;
}) {
  const [state, action] = useFormState(publishIssue, initialState);

  if (state.status === "success") {
    return (
      <Alert tone="success" title="Published">
        {state.count} {state.count === 1 ? "article is" : "articles are"} now on
        the public site.{" "}
        {state.emailed > 0
          ? `${state.emailed} corresponding ${state.emailed === 1 ? "author was" : "authors were"} emailed the link.`
          : "No author could be emailed — tell them by hand."}{" "}
        <Link
          href={`/issues/${state.issueSlug}`}
          className="font-medium text-primary hover:underline"
        >
          Open the published issue
        </Link>
      </Alert>
    );
  }

  const blocked = readiness.items.filter((i) => i.problems.length > 0);

  return (
    <div className="rounded-xl border border-brand-border p-4 md:p-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Publishing puts every manuscript in this issue on the public site as an
        open-access article, adds the issue to the archive and emails each
        corresponding author the link. Articles are published{" "}
        <strong className="font-medium text-foreground">without a DOI</strong>{" "}
        until the journal has a Crossref prefix; one can be added to them then.
      </p>

      {!readiness.ready && (
        <div className="mt-4 space-y-3">
          {readiness.issueProblems.map((p) => (
            <p key={p} className="text-sm text-warning">
              {p}
            </p>
          ))}
          {blocked.length > 0 && (
            <>
              <p className="text-sm font-medium">Not ready yet:</p>
              <ul className="space-y-2">
                {blocked.map((i) => (
                  <li key={i.submissionId} className="text-sm">
                    <Link
                      href={`/production/${i.submissionId}/galleys`}
                      className="font-medium text-primary hover:underline"
                    >
                      {i.reference}
                    </Link>{" "}
                    <span className="text-muted-foreground">— {i.title}</span>
                    <ul className="mt-1 list-disc pl-5 text-muted-foreground">
                      {i.problems.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {readiness.ready && (
        <form action={action} className="mt-4 space-y-4">
          <input type="hidden" name="issueId" value={issueId} />
          <label className="flex items-start gap-3 text-sm">
            <Checkbox name="confirm" value="yes" required className="mt-0.5" />
            <span>
              I have checked the running order and the final galleys. I
              understand published articles cannot be taken down from here.
            </span>
          </label>
          {state.status === "error" && (
            <Alert tone="danger" title="Not published">
              {state.message}
            </Alert>
          )}
          <PublishButton />
        </form>
      )}
    </div>
  );
}

function PublishButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Globe className="size-4" aria-hidden />
      {pending ? "Publishing…" : "Publish this issue"}
    </Button>
  );
}
