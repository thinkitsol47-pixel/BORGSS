import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand ISR revalidation. Backend calls this when an editor publishes
 * an issue / article so the public pages update without a full rebuild.
 * POST { path?: string, tag?: string }  with header x-revalidate-secret
 */
export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const secret = request.headers.get("x-revalidate-secret");
  // Unset, or still the `.env.example` placeholder, means closed — not open to
  // anyone who reads that placeholder in the public repository.
  if (!expected || expected === "change-me" || secret !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { path, tag } = await request.json().catch(() => ({}));
  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);
  return NextResponse.json({ ok: true, revalidated: { path, tag } });
}
