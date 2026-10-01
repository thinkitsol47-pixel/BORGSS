"use server";

import { cookies } from "next/headers";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation/schemas";
import { supabaseServer, supabaseAdmin } from "@/lib/auth/supabase";
import { db } from "@/lib/db";
import type { Role } from "@/config/roles";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

/**
 * Auth Server Actions, on Supabase Auth.
 *
 * **Two stores, joined on one id.** Supabase Auth holds the credentials and the
 * session; this app's `User` table holds the name, roles, affiliation and
 * notification settings the portal renders. `User.id` *is* the `auth.users` id
 * — decided in phase 1 precisely so that no second key has to be kept in step.
 *
 * **What still does not work:** anything that needs an email to arrive.
 * Supabase's built-in mailer is rate-limited to a handful of messages an hour
 * and is not a delivery service, so password reset and address verification
 * stay incomplete until Resend lands in phase 6. Both actions below say so on
 * screen rather than reporting a success the visitor's inbox will contradict.
 */

export type AuthState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level messages, keyed by input name. */
  errors?: Record<string, string>;
  /** Echoed back so the form can be repopulated after a failed submit. */
  values?: Record<string, string>;
  /**
   * Where the browser should go after a successful sign-in.
   *
   * **The action deliberately does not `redirect()` itself.** `redirect()`
   * works by throwing, and the throw aborts the action before the
   * `Set-Cookie` headers Supabase queued during `signInWithPassword` are
   * flushed. The session is created — but the browser never receives the
   * cookie, so the very next request looks signed out and the middleware
   * bounces it straight back to `/login` with the fields cleared. That is
   * precisely the loop this field exists to prevent: the cookie now goes out
   * with a normal response, and the client navigates once it has it.
   */
  redirectTo?: string;
};

/** Collects Zod issues into the flat shape the forms render. */
function fieldErrors(error: { issues: { path: (string | number)[]; message: string }[] }) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Strips secrets before echoing a failed submission back into the form. */
function safeValues(raw: Record<string, string>) {
  const { password, confirmPassword, website, ...rest } = raw;
  void password;
  void confirmPassword;
  void website;
  return { ...rest, website: "" };
}

/* ------------------------------------------------------------------ login */

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = loginSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      errors: fieldErrors(parsed.error),
      values: safeValues(raw),
    };
  }

  const email = parsed.data.email.trim().toLowerCase();

  const { error } = await supabaseServer().auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    // Deliberately one message for both "no such account" and "wrong password".
    // Distinguishing them tells an attacker which addresses are registered,
    // which is the same account-enumeration leak the reset flow avoids.
    return {
      status: "error",
      message: "That email address and password do not match an account.",
      values: safeValues(raw),
    };
  }

  // Returned, not redirected. See `AuthState.redirectTo` for why: a
  // `redirect()` here throws before the session cookie is flushed, so the
  // browser lands on the portal with no cookie and is sent back to /login.
  return { status: "success", redirectTo: safeNext(raw.next) };
}

/**
 * Where to land after signing in.
 *
 * Only in-app paths are accepted. `next` arrives in the URL, so without this an
 * emailed `/login?next=https://elsewhere.example` would turn the journal's own
 * sign-in page into an open redirect — the visitor authenticates, and the
 * journal hands them to someone else's site looking as if it vouched for it.
 * A protocol-relative `//host` is rejected for the same reason.
 */
function safeNext(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }
  return value;
}

/* --------------------------------------------------------------- register */

export async function register(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      errors: fieldErrors(parsed.error),
      values: safeValues(raw),
    };
  }

  // A filled honeypot is a bot. Report success so it learns nothing, and drop
  // the submission.
  if (parsed.data.website) {
    return { status: "success" };
  }

  const d = parsed.data;
  const email = d.email.trim().toLowerCase();
  const admin = supabaseAdmin();

  // The auth account first. Its generated id becomes the profile's primary key,
  // so this has to succeed before there is anything to write a profile against.
  //
  // `email_confirm: true` because no mail provider is connected yet (phase 6):
  // leaving it false would create accounts that can never sign in, since the
  // confirmation link would never arrive. **Set this back to false when Resend
  // lands** — until then an unverified address can register, which is the
  // honest trade for the flow working at all.
  const created = await admin.auth.admin.createUser({
    email,
    password: d.password,
    email_confirm: true,
    user_metadata: { name: d.name },
  });

  if (created.error || !created.data.user) {
    const already = /already|exists|registered/i.test(created.error?.message ?? "");
    return {
      status: "error",
      message: already
        ? "An account already exists for that email address. Try signing in, or reset your password."
        : "The account could not be created. Please try again, or contact the editorial office.",
      errors: already ? { email: "This address is already registered." } : undefined,
      values: safeValues(raw),
    };
  }

  // "both" is not a role — it is the register form's way of asking for two.
  // `roles.ts` has no such member, so it is expanded here rather than stored.
  const roles: Role[] =
    d.intendedRole === "both" ? ["author", "reviewer"] : [d.intendedRole];

  try {
    await db.user.create({
      data: {
        id: created.data.user.id,
        name: d.name,
        email,
        affiliation: d.institution,
        country: d.country,
        orcid: d.orcid || null,
        // `active`, not `invited`: they registered themselves and can sign in
        // now. `invited` is for an account the office created for someone who
        // has not yet appeared.
        status: "active",
        roles: { create: roles.map((role) => ({ role })) },
      },
    });
  } catch {
    // The auth account exists but the profile does not, and `getCurrentUser()`
    // returns null for exactly that state — the visitor would authenticate into
    // a redirect loop. Removing the auth account leaves the address free to
    // register again, which is the recoverable outcome.
    await admin.auth.admin.deleteUser(created.data.user.id);
    return {
      status: "error",
      message: "The account could not be created. Please try again, or contact the editorial office.",
      values: safeValues(raw),
    };
  }

  // Not awaited for its result beyond logging: the account exists either way,
  // and a mail failure must not turn a successful registration into an error
  // the visitor would retry — producing "this address is already registered".
  const mail = await sendEmail(welcomeEmail({ to: email, name: d.name }));

  return {
    status: "success",
    message: mail.ok
      ? "Your account has been created and a confirmation is on its way. You can sign in now."
      : "Your account has been created — you can sign in now. No confirmation email was sent; email delivery is still being set up.",
    values: { email },
  };
}

/* -------------------------------------------------------- forgot password */

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = forgotPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted field and try again.",
      errors: fieldErrors(parsed.error),
      values: safeValues(raw),
    };
  }

  if (parsed.data.website) {
    return { status: "success" };
  }

  // Supabase mints the token and sends the link. The result is deliberately
  // ignored: it distinguishes "no such account" from "sent", and returning that
  // difference would let anyone test which addresses are registered. Same
  // message either way.
  await supabaseServer().auth.resetPasswordForEmail(
    parsed.data.email.trim().toLowerCase(),
    // The callback route, not the page: Supabase sends a one-time code that has
    // to be exchanged for a session server-side before the form can act.
    { redirectTo: `${siteUrl()}/auth/callback?next=/reset-password` },
  );

  // TODO(phase 6): Supabase's built-in mailer is rate-limited to a few messages
  // an hour and is not a delivery service. Until Resend is connected, a reset
  // link may not arrive at all — which is why the message below says so rather
  // than promising an email the visitor will sit waiting for.
  return {
    status: "success",
    message:
      "If an account exists for that address, a reset link is on its way. Email delivery is still being set up, so if nothing arrives within a few minutes, contact the editorial office.",
  };
}

/** The origin reset and verification links come back to. */
function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/* --------------------------------------------------------- reset password */

export async function resetPassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;
  const parsed = resetPasswordSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: "Please correct the highlighted fields and try again.",
      errors: fieldErrors(parsed.error),
      values: safeValues(raw),
    };
  }

  // Following the emailed link signs the browser in with a recovery session, so
  // by the time this form is submitted there is a session to act on and
  // `updateUser` is the whole operation. Supabase verifies the token's age and
  // single use itself.
  const supabase = supabaseServer();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return {
      status: "error",
      message:
        "This reset link has expired or has already been used. Request a new one from the forgot-password page.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      status: "error",
      message: "The password could not be changed. Request a new reset link and try again.",
    };
  }

  return {
    status: "success",
    message: "Your password has been changed. You can sign in with it now.",
  };
}

/* ----------------------------------------------------- resend verification */

export async function resendVerification(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return {
      status: "error",
      message: "We do not have an address to send to. Try registering again.",
    };
  }

  // Registration currently confirms addresses on creation (see `register`),
  // because no mail provider is connected — so there is nothing outstanding to
  // re-send, and calling Supabase would either fail or send a link that cannot
  // be delivered. Saying so beats a success message the inbox contradicts.
  //
  // TODO(phase 6): with Resend connected, set `email_confirm: false` in
  // `register` and make this call `supabase.auth.resend({ type: "signup", email })`,
  // rate limited per address.
  return {
    status: "success",
    message:
      "Email verification is not connected yet, so nothing has been sent — and nothing is waiting on it. Your account is already usable; sign in with the password you chose.",
  };
}

/* Sign-out is `src/app/logout/route.ts`, not an action here: the topbar posts
   a plain form to it, which works without JavaScript. It is POST only — a GET
   sign-out link was prefetched by Next and ended sessions on its own. */
