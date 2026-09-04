import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * On-demand ISR revalidation. Backend calls this when an editor publishes
 * an issue / article so the public pages update without a full rebuild.
 * POST { path?: string, tag?: string }  with header x-revalidate-secret
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const { path, tag } = await request.json().catch(() => ({}));
  if (path) revalidatePath(path);
  if (tag) revalidateTag(tag);
  return NextResponse.json({ ok: true, revalidated: { path, tag } });
}
