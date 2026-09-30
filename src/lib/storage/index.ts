import "server-only";
import { v2 as cloudinary } from "cloudinary";

/**
 * The only module that talks to Cloudinary.
 *
 * Same rule as `lib/email/send.ts`: a provider reached from thirty places
 * cannot be swapped, rate-limited or audited. It is also the only way to keep
 * the confidentiality rules below in one reviewable place.
 *
 * ## Confidentiality — read this before writing an upload
 *
 * **Cloudinary's default is a permanently public URL.** A manuscript under
 * double-blind review is confidential, so every upload here passes
 * `{ resource_type: "raw", type: "authenticated" }`, which stops Cloudinary
 * serving it to an unsigned request.
 *
 * **`upload()` returns a URL that never expires — never keep it.** This was
 * verified against the live account: the `secure_url` Cloudinary hands back
 * carries a baked-in signature (`s--2T3iEDMx--`) and opens with a plain fetch,
 * forever. That URL is a bearer token for the file. So `putFile` deliberately
 * **does not return it**: it returns the `publicId` and nothing else, and there
 * is no code path here that can hand a caller the permanent link.
 *
 * **A `publicId` on its own opens nothing.** Also verified: fetching
 * `/raw/authenticated/<publicId>`, `/raw/upload/<publicId>` and the versioned
 * form all return 401 or 404. That is what makes the id safe to store in the
 * database and safe to pass around inside the app.
 *
 * **Every read mints a fresh short-lived URL, after an entitlement check.**
 * `signedUrlFor` does the signing; deciding *who may read this file* is the
 * caller's job and must happen first. A signed URL is a bearer token too —
 * never store one, never put one in an email, never log one.
 *
 * ## Published articles are the exception
 *
 * An open-access journal exists to be read, so a published article's PDF is
 * public on purpose. `putPublicFile` is that path, kept separate and named so
 * the difference is deliberate rather than a forgotten flag.
 */

/** How long a download link lives. Long enough to click, short enough to leak harmlessly. */
const SIGNED_URL_TTL_SECONDS = 600;

function configured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

function client() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

/** Whether file storage is wired up. Screens use it to say what they cannot do. */
export function isStorageConfigured(): boolean {
  return configured();
}

export type PutResult =
  | { ok: true; publicId: string; bytes: number }
  | { ok: false; reason: "not-configured" | "failed"; message: string };

/**
 * Stores a confidential file — a manuscript, title page, supplementary file,
 * cover letter, or a galley still in production.
 *
 * Returns the `publicId` and **never a URL**. See the note above: the URL
 * Cloudinary returns is permanent, and returning it from here is how it would
 * end up in a database column six months from now.
 */
export async function putFile(params: {
  /** Raw bytes. */
  content: Buffer;
  /** Where it belongs, e.g. `submissions/<submissionId>`. */
  folder: string;
  /** Stable name within the folder, e.g. `manuscript-v2`. */
  name: string;
}): Promise<PutResult> {
  if (!configured()) {
    return {
      ok: false,
      reason: "not-configured",
      message: "File storage is not configured, so nothing was uploaded.",
    };
  }

  try {
    const result = await client().uploader.upload(
      `data:application/octet-stream;base64,${params.content.toString("base64")}`,
      {
        // `raw` because a .docx is not an image and must not be transformed.
        resource_type: "raw",
        // The flag that makes this private. Removing it publishes the file.
        type: "authenticated",
        folder: params.folder,
        public_id: params.name,
        overwrite: false,
      },
    );

    return { ok: true, publicId: result.public_id, bytes: result.bytes };
  } catch (cause) {
    return {
      ok: false,
      reason: "failed",
      message:
        cause instanceof Error ? cause.message : "The file could not be uploaded.",
    };
  }
}

/**
 * A link that opens a confidential file, valid for ten minutes.
 *
 * **The caller must have checked entitlement before calling this.** This
 * function signs; it does not authorise. Handing it a `publicId` is taken as a
 * statement that the reader is allowed the file.
 *
 * The result is a bearer token: never store it, never email it, never log it.
 */
export function signedUrlFor(publicId: string): string | null {
  if (!configured()) return null;

  return client().utils.private_download_url(publicId, "", {
    resource_type: "raw",
    type: "authenticated",
    expires_at: Math.floor(Date.now() / 1000) + SIGNED_URL_TTL_SECONDS,
  });
}

/**
 * Stores a file that is meant to be public — a published article's PDF.
 *
 * Separate from `putFile` and named for what it does, so that publishing
 * something is a decision someone made rather than a flag someone forgot. The
 * URL it returns is permanent, which is correct here and only here.
 */
export async function putPublicFile(params: {
  content: Buffer;
  folder: string;
  name: string;
}): Promise<PutResult & { url?: string }> {
  if (!configured()) {
    return {
      ok: false,
      reason: "not-configured",
      message: "File storage is not configured, so nothing was uploaded.",
    };
  }

  try {
    const result = await client().uploader.upload(
      `data:application/octet-stream;base64,${params.content.toString("base64")}`,
      {
        resource_type: "raw",
        type: "upload",
        folder: params.folder,
        public_id: params.name,
        overwrite: false,
      },
    );

    return {
      ok: true,
      publicId: result.public_id,
      bytes: result.bytes,
      url: result.secure_url,
    };
  } catch (cause) {
    return {
      ok: false,
      reason: "failed",
      message:
        cause instanceof Error ? cause.message : "The file could not be uploaded.",
    };
  }
}

/**
 * Whether a stored path points at a real upload.
 *
 * The seed script wrote paths like `mock/s1/title-page.docx` from before file
 * storage existed; a real `publicId` looks like
 * `submissions/<uuid>/manuscript`. Screens use this to render a plain row
 * rather than a download link that would 404 — a dead link behind a download
 * icon reads as the portal being broken, not as a file never uploaded.
 */
export function isStoredFile(storagePath: string): boolean {
  return storagePath.startsWith("submissions/");
}

/**
 * Removes a confidential file.
 *
 * Used when an upload is replaced during a draft, not for withdrawing a
 * manuscript — a submission's file history is part of the record and is kept.
 */
export async function deleteFile(publicId: string): Promise<boolean> {
  if (!configured()) return false;

  try {
    const result = await client().uploader.destroy(publicId, {
      resource_type: "raw",
      type: "authenticated",
    });
    return result.result === "ok";
  } catch {
    return false;
  }
}
