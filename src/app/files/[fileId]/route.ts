import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { fileAccessFor, galleyAccessFor } from "@/lib/storage/entitlement";
import { signedUrlFor, isStorageConfigured } from "@/lib/storage";

/**
 * The one way a confidential file is read.
 *
 * **Why a redirect and not a stored link.** Every download link in the portal
 * points here — `/files/<id>` — which is a stable, shareable, useless-on-its-own
 * URL. The signed Cloudinary URL is minted per request, lives ten minutes, and
 * never touches the database, an email or a rendered page. Someone who copies a
 * portal link and sends it to a colleague sends them to this guard, which asks
 * who *they* are; someone who copies the redirected URL sends a key that has
 * already expired by the time it is read.
 *
 * **Not-found and forbidden answer identically.** Probing ids would otherwise
 * reveal which manuscripts exist, and on a double-blind journal that is itself
 * disclosure.
 *
 * The entitlement rule lives in `lib/storage/entitlement.ts`, deliberately
 * apart from this handler so it can be read and reasoned about on its own.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { fileId: string } },
) {
  const user = await getCurrentUser();

  // The middleware does not cover /files, because this route answers for
  // authenticated readers only and says so itself rather than redirecting a
  // download into a login page.
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  if (!isStorageConfigured()) {
    return NextResponse.json(
      { error: "File storage is not configured." },
      { status: 503 },
    );
  }

  // Two kinds of file, one guard. A galley lives in `ProductionGalley`, not
  // `SubmissionFile`, and its rule is narrower — production and editorial staff
  // only, never the author or a reviewer. The `galley:` prefix keeps both on
  // this one route so there is a single place where a signed URL is minted,
  // rather than a second handler that could drift from this one.
  const access = params.fileId.startsWith("galley:")
    ? await galleyAccessFor(user, params.fileId.slice("galley:".length))
    : await fileAccessFor(user, params.fileId);

  if (!access.allowed) {
    // One answer for both cases. See the note above.
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const url = signedUrlFor(access.publicId);

  if (!url) {
    return NextResponse.json(
      { error: "The file could not be opened." },
      { status: 503 },
    );
  }

  /**
   * The bytes are streamed through this route rather than redirected to.
   *
   * **Why not a 302, which is cheaper.** Cloudinary names the download from the
   * last segment of the storage key, and the keys here are deterministic
   * (`manuscript`, `titlePage`, `pdf-v2`) precisely so that re-running a step
   * replaces a file instead of accumulating copies. The author therefore
   * received a file called `manuscript` — no extension, nothing identifying the
   * paper — and Windows could not open it.
   *
   * Every documented way of overriding that name at the signing end was tried
   * against the live account and ignored: the `format` argument, `attachment:
   * true`, `attachment: "<name>"`, `flags: attachment:<name>` and
   * `target_filename` all still returned `filename="manuscript"`. So the name
   * has to be set by the only party that knows it — this route, which has the
   * real filename from the entitlement check.
   *
   * The cost is that a manuscript's bytes now pass through the server instead
   * of going straight from Cloudinary to the browser. At this journal's volume
   * that is irrelevant, and it buys back something worth more than the hop: the
   * signed URL never reaches the browser at all, so it cannot be copied out of
   * a history list or a referrer header.
   */
  const upstream = await fetch(url);

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "The file could not be opened." },
      { status: 502 },
    );
  }

  // Quotes and backslashes would terminate the header value early; a filename
  // is author-supplied text, so it is escaped rather than trusted. `filename*`
  // carries the UTF-8 form for names outside ASCII, with the plain `filename`
  // left as the fallback older clients read.
  const safe = access.filename.replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(access.filename);

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/octet-stream",
      "Content-Disposition": `attachment; filename="${safe}"; filename*=UTF-8''${encoded}`,
      ...(upstream.headers.get("content-length")
        ? { "Content-Length": upstream.headers.get("content-length")! }
        : {}),
      // Never cached: entitlement is checked per request, and a shared cache
      // must not serve one reader's manuscript to another.
      "Cache-Control": "no-store, private",
    },
  });
}
