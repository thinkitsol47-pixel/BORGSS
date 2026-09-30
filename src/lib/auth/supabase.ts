import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Auth clients.
 *
 * **Three of them, and the difference matters.**
 *
 * - `supabaseServer()` runs inside a Server Component or Server Action and
 *   speaks for the signed-in visitor. It reads and writes the session cookies.
 * - `supabaseAdmin()` runs on the server with the secret key and speaks for
 *   nobody — it is how an account gets created or a password is reset by the
 *   office. It bypasses every check, so it is never given a request's cookies
 *   and never reachable from the browser.
 * - The browser client lives in `supabase-browser.ts`, which is a client module
 *   and cannot be imported from here without dragging `next/headers` into the
 *   bundle.
 *
 * **On the key names.** Supabase renamed its keys: what the dashboard now calls
 * a *publishable* key (`sb_publishable_…`) is the anon key, and a *secret* key
 * (`sb_secret_…`) is the service-role key. The environment variables keep the
 * conventional names so that `@supabase/ssr`'s own documentation still lines
 * up with this file.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  // Failing here names the missing variable. The alternative is an opaque
  // "Invalid API key" from Supabase on the first sign-in attempt.
  if (!value) {
    throw new Error(
      `${name} is not set. Copy it from the Supabase dashboard (Project Settings → API Keys) into .env.local.`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function supabaseAnonKey(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/**
 * The visitor's own client, for Server Components and Server Actions.
 *
 * A Server Component cannot set cookies — Next throws if it tries — but the
 * Supabase client refreshes an expiring token by writing one. So the setter
 * swallows that specific failure: the refreshed token is still returned and
 * used for this render, and the middleware, which *can* write cookies,
 * persists it on the next request. Without the catch, every render that
 * happened to land on a token refresh would crash the page.
 */
export function supabaseServer() {
  const store = cookies();

  return createServerClient(supabaseUrl(), supabaseAnonKey(), {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options);
          }
        } catch {
          // Called from a Server Component. See the note above.
        }
      },
    },
  });
}

/**
 * The service-role client. **Server only, and never with a request's cookies.**
 *
 * This key bypasses Row Level Security and every auth check, which is exactly
 * why it exists — creating an account, confirming an address, or resetting a
 * password on someone's behalf are all things the visitor's own client is not
 * allowed to do. Give it a task and let it go; never hand it a session.
 */
export function supabaseAdmin() {
  return createClient(supabaseUrl(), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
