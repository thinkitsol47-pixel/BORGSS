import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageSquare, Paperclip } from "lucide-react";
import { requireUser } from "@/lib/auth/require-role";
import { getSubmissionById } from "@/lib/api/submissions";
import { SubmissionHeader } from "@/components/portal/submission-header";
import { Alert, Card, EmptyState } from "@/components/ui";
import { siteConfig } from "@/config/site.config";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

export default async function Page({
  params,
}: {
  params: { submissionId: string };
}) {
  await requireUser();
  const submission = await getSubmissionById(params.submissionId);
  if (!submission) notFound();

  // Oldest first: correspondence reads as a conversation, not a feed.
  const messages = [...submission.messages].sort(
    (a, b) => +new Date(a.sentAt) - +new Date(b.sentAt),
  );

  return (
    <div className="px-4 py-6 md:px-8 md:py-10">
      <SubmissionHeader submission={submission} active="messages" />

      <div className="mt-8 max-w-3xl">
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No correspondence yet"
            description="Messages between you and the editorial office about this manuscript will appear here."
          />
        ) : (
          <ol className="space-y-4">
            {messages.map((m) => {
              const fromAuthor = m.fromRole === "author";
              return (
                <li key={m.id}>
                  <Card
                    className={cn(
                      "p-5",
                      // The author's own messages sit on a tinted ground so a
                      // long thread can be scanned without reading each header.
                      fromAuthor
                        ? "border-brand-border bg-brand-tint/25"
                        : undefined,
                    )}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <p className="text-sm font-medium">
                        {m.from}
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {fromAuthor ? "You" : "Editorial"}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(m.sentAt)}
                      </p>
                    </div>

                    <p className="mt-2 font-serif text-base font-semibold">
                      {m.subject}
                    </p>

                    <div className="mt-2 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                      {m.body.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>

                    {m.attachments && m.attachments.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-2 border-t pt-3">
                        {m.attachments.map((a) => (
                          <li
                            key={a}
                            className="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs text-muted-foreground"
                          >
                            <Paperclip className="size-3" aria-hidden />
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-8">
          <Alert tone="info" title="Replying is not available yet">
            <p>
              Messaging through the portal arrives with the backend. To reply
              about this manuscript, email{" "}
              <a
                href={`mailto:${siteConfig.contact.editorialOffice}?subject=${encodeURIComponent(submission.reference)}`}
                className="font-medium text-primary hover:text-brand-dark hover:underline"
              >
                {siteConfig.contact.editorialOffice}
              </a>{" "}
              quoting <strong>{submission.reference}</strong>.
            </p>
          </Alert>
        </div>
      </div>
    </div>
  );
}
