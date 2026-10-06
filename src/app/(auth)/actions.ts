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
import { verificationEmail } from "@/lib/email/templates";

/**
 * Auth Server Actions, on Supabase Auth.
 *
 * **Two stores, joined on one id.** Supabase Auth holds the credentials and the
 * session; this app's `User` table holds the name, roles, affiliation and
 * notification settings the portal renders. `User.id` *is* the `auth.users` id
 * — decided in phase 1 precisely so that no second key has to be kept in step.
 *
 * **Two senders, one domain** (since 2026-10-01). Address verification is
 * minted here with `generateLink` and sent through Resend by `sendEmail`, so the
 * wording is ours. The password-reset link is sent by Supabase itself, through
 * custom SMTP pointed at Resend (`no-reply@borjss.online`) — set in the
 * Supabase dashboard, not in this repository. If reset mail stops arriving,
 * look there first.
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
  /**
   * Set when the password was right but the address was never confirmed, so
   * the form can offer a fresh link instead of a dead end. Only reachable with
   * the correct password, so it tells an attacker nothing new.
   */
  unconfirmedEmail?: string;
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

  if (error?.code === "email_not_confirmed") {
    return {
      status: "error",
      message:
        "This email address has not been confirmed yet. Open the link we emailed you when you registered, or send a new one.",
      values: safeValues(raw),
      unconfirmedEmail: email,
    };
  }

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
  // **Unconfirmed until the emailed link is followed.** `generateLink` creates
  // the account exactly as `signUp` would — Supabase then refuses its password
  // with `email_not_confirmed` — but sends nothing itself and returns the
  // token, so the message goes out through `sendEmail` in the journal's own
  // words rather than Supabase's template.
  const created = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password: d.password,
    options: { data: { name: d.name } },
  });

  if (created.error || !created.data.user) {
    const already =
      created.error?.code === "email_exists" ||
      /already|exists|registered/i.test(created.error?.message ?? "");
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
        // `active`, not `invited`: they registered themselves. Whether they
        // can sign in yet is Supabase's to decide — it waits on the emailed
        // link. `invited` is for an account the office created for someone
        // who has not yet appeared.
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

  // A mail failure is reported, not thrown: the account exists either way, and
  // turning success into an error would make the visitor retry into "this
  // address is already registered". The next page offers a fresh link.
  const mail = await sendEmail(
    verificationEmail({
      to: email,
      name: d.name,
      link: confirmLink(created.data.properties.hashed_token),
    }),
  );

  return {
    status: "success",
    message: mail.ok
      ? "Your account has been created. We have emailed a link to confirm your address — open it to finish, and then you can sign in."
      : "Your account has been created, but the confirmation email could not be sent. Use “Send the link again” on the next page, or contact the editorial office.",
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

  return {
    status: "success",
    message:
      "If an account exists for that address, a reset link is on its way. Check your spam folder if it has not arrived within a few minutes.",
  };
}

/** The origin reset and verification links come back to. */
function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

/**
 * The emailed confirmation link. It opens `/verify-email`, whose button posts
 * the `token_hash` to `/auth/confirm` — never the confirming route directly,
 * because mail scanners open links and would spend the single-use token. A
 * `token_hash`, unlike a PKCE `code`, works on a different device or browser
 * from the one that registered.
 */
function confirmLink(tokenHash: string): string {
  return `${siteUrl()}/verify-email?token_hash=${encodeURIComponent(tokenHash)}`;
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

  // An account the office created sits at `invited` until its holder appears.
  // Setting a password is that moment — nothing else ever moved it on, so
  // every invited account would have read "Invited" forever.
  await db.user.updateMany({
    where: { id: data.user.id, status: "invited" },
    data: { status: "active" },
  });

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
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email) {
    return {
      status: "error",
      message: "We do not have an address to send to. Try registering again.",
    };
  }

  // The same answer whatever happens below. The address arrives in a URL, so
  // saying "no such account" or "already confirmed" would let anyone test
  // which addresses are registered.
  const answer: AuthState = {
    status: "success",
    message:
      "If that address has an account waiting to be confirmed, a new link is on its way. Check your spam folder if it has not arrived within a few minutes.",
  };

  const profile = await db.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  });
  if (!profile) return answer;

  const admin = supabaseAdmin();
  const { data: found } = await admin.auth.admin.getUserById(profile.id);
  // Seeded profiles have no auth account; a confirmed one needs nothing.
  if (!found.user || found.user.email_confirmed_at) return answer;

  // At most one link a minute. Minting a link rewrites the auth row, so its
  // `updated_at` is when the last one went out — without this, the button is a
  // way to fill a stranger's inbox.
  const last = Date.parse(found.user.updated_at ?? "");
  if (Number.isFinite(last) && Date.now() - last < 60_000) return answer;

  // A magic-link token, because a second "signup" link for an existing account
  // is refused. Following it confirms the address just the same — verified
  // against this project before it was written.
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  if (!link.error) {
    await sendEmail(
      verificationEmail({
        to: email,
        name: profile.name,
        link: confirmLink(link.data.properties.hashed_token),
      }),
    );
  }

  return answer;
}

/* Sign-out is `src/app/logout/route.ts`, not an action here: the topbar posts
   a plain form to it, which works without JavaScript. It is POST only — a GET
   sign-out link was prefetched by Next and ended sessions on its own. */
