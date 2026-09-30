import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

/**
 * The Prisma client, as a single instance.
 *
 * **The pooled connection, deliberately.** `DATABASE_URL` is Supabase's pooler
 * (port 6543, transaction mode); serverless functions open a connection per
 * invocation, and the pooler is what stops that exhausting Postgres.
 * `prisma.config.ts` points at `DIRECT_URL` (port 5432) instead, because
 * migrations issue statements a transaction-mode pooler cannot run. Confusing
 * the two produces either "too many connections" in production or a migration
 * that hangs.
 *
 * Next's dev server reloads modules on every edit. Constructing a client per
 * reload opens a new pool each time and exhausts Postgres within a few minutes
 * of editing, so the instance is cached on `globalThis` — which survives a
 * reload — in development only. In production the module is evaluated once and
 * the cache is unnecessary.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;

  // Failing here beats failing on the first query: the message names the
  // missing variable, rather than surfacing as a connection error somewhere
  // inside a page render.
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and fill in the Supabase connection strings.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    // Queries are logged in development because a page that renders slowly is
    // almost always issuing more queries than its author expected.
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/**
 * Every row this app looks up by id uses a `@db.Uuid` primary key, but a
 * dynamic route segment (`[id]`, `[reviewId]`, ...) is just a string — and the
 * old mock data used short ids like `"s1"` or `"rv4"`, which are still out
 * there in bookmarks, browser history and hard-coded links from before this
 * module read the database. Passing one of those straight to `findUnique`
 * throws a Postgres syntax error instead of the 404 a bad id should produce.
 * Callers check this before querying, so a not-a-real-id id behaves exactly
 * like a real id with no matching row.
 */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}
