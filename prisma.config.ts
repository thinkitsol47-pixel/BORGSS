import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js loads `.env.local` ahead of `.env`; the Prisma CLI runs outside Next
// and would otherwise see only `.env`, whose values are placeholders. Load both
// in the same order, `.env.local` first — dotenv keeps the first value it sees,
// so the real credentials win and `.env` stays a committed fallback.
loadEnv({ path: ".env.local" });
loadEnv();

/**
 * Prisma configuration.
 *
 * Prisma 7 moved connection URLs out of `schema.prisma` into this file, so the
 * schema itself carries no environment coupling.
 *
 * **This file is the CLI's connection, not the app's.** It is what
 * `prisma migrate`, `prisma db push` and `prisma studio` use, and every one of
 * those issues statements a transaction-mode pooler cannot run — so it points
 * at `DIRECT_URL` (Supabase port 5432).
 *
 * The running app connects separately through `src/lib/db.ts`, which uses the
 * **pooled** `DATABASE_URL` (port 6543). Serverless functions open a
 * connection per invocation, and the pooler is what stops that exhausting
 * Postgres. Confusing the two is the usual cause of either "too many
 * connections" in production or a migration that hangs.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
