import { Download, FileText, Lock } from "lucide-react";

/**
 * A download link for a confidential file.
 *
 * **Always `/files/<id>`, never a storage URL.** That route checks who is
 * asking before minting a ten-minute signed URL, so this link is safe to render
 * on any screen, safe to copy, and useless to anyone not entitled to the file.
 * A component that took a URL instead would be one careless prop away from
 * putting a bearer token in the page source.
 *
 * **A row with no stored file renders as text, not a dead link.** The seeded
 * fixtures carry placeholder paths (`mock/s1/...`) from before Cloudinary, and
 * a 404 behind a download icon reads as the portal being broken rather than as
 * the file never having been uploaded.
 */
export function FileLink({
  id,
  filename,
  detail,
  stored = true,
}: {
  id: string;
  filename: string;
  /** The line underneath — kind, size, date. */
  detail: string;
  /** False when the row predates real storage. */
  stored?: boolean;
}) {
  const body = (
    <>
      <span className="min-w-0 flex-1">
        <span className="block break-all text-sm font-medium">{filename}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {detail}
        </span>
      </span>
      {stored ? (
        <Download
          className="mt-0.5 size-4 shrink-0 text-primary"
          aria-hidden
        />
      ) : (
        <Lock className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      )}
    </>
  );

  if (!stored) {
    return (
      <li className="flex items-start gap-3 p-4">
        <FileText
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        {body}
        <span className="sr-only">Not available for download</span>
      </li>
    );
  }

  return (
    <li>
      <a
        href={`/files/${id}`}
        className="flex items-start gap-3 p-4 hover:bg-brand-tint focus-visible:bg-brand-tint"
      >
        <FileText
          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        {body}
        <span className="sr-only">Download {filename}</span>
      </a>
    </li>
  );
}
