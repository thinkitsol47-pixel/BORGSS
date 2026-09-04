import { NextResponse } from "next/server";

/**
 * tRPC handler placeholder. Replace with:
 *   import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
 *   import { appRouter } from "@/server/routers/_app";
 * once the API layer is added.
 */
function handler() {
  return NextResponse.json(
    { error: "tRPC router not yet mounted" },
    { status: 501 },
  );
}

export { handler as GET, handler as POST };
