import { readFileSync } from "node:fs";

/**
 * A real signed-in session for the audit scripts.
 *
 * **Both audits have to reach the portal pages, and there is no demo door any
 * more.** They used to send `borjss_dev_role=superAdmin`, a cookie that named a
 * role and skipped authentication entirely; that cookie was deleted along with
 * the rest of the demo sign-in. Without a session every guarded route now
 * answers 307 to /login, and an audit would quietly grade the login page 96
 * times and report zero findings.
 *
 * So the scripts sign in for real, with credentials from the environment, and
 * send the session cookie `@supabase/ssr` expects. Nothing is stored: the token
 * lives for the length of the run.
 *
 * Set `AUDIT_EMAIL` and `AUDIT_PASSWORD` in `.env.local`. Without them the
 * audits still run, but only over the public site — and they say so rather than
 * reporting a clean sweep of pages they never saw.
 */

/** Minimal .env.local reader — the audits are plain .mjs with no dotenv. */
function env() {
  const values = {};
  for (const file of [".env.local", ".env"]) {
    let text;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    // `\r?\n`, because a .env written on Windows carries CRLF and a stray \r
    // would otherwise end up inside every value — including the password,
    // which then fails to sign in with no visible reason.
    for (const line of text.split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
      if (!match) continue;
      const [, key, raw] = match;
      values[key] ??= raw.trim().replace(/^["']|["']$/g, "");
    }
  }
  return values;
}

/**
 * Signs in and returns a `Cookie` header value, or null.
 *
 * The cookie name and its `base64-` prefixed JSON body are what
 * `@supabase/ssr` reads on the server — the same shape the browser would hold
 * after a real sign-in.
 */
export async function auditCookie() {
  const e = env();
  const url = e.NEXT_PUBLIC_SUPABASE_URL;
  const key = e.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = e.AUDIT_EMAIL;
  const password = e.AUDIT_PASSWORD;

  if (!url || !key || !email || !password) return null;

  let session;
  try {
    const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    session = await res.json();
  } catch {
    return null;
  }

  if (!session?.access_token) return null;

  const ref = new URL(url).hostname.split(".")[0];
  const payload = Buffer.from(JSON.stringify(session)).toString("base64");
  return `sb-${ref}-auth-token=base64-${payload}`;
}
