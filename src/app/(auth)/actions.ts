"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation/schemas";
import { DEMO_ACCOUNTS, ROLE_COOKIE } from "@/lib/auth/current-user";

/**
 * Auth Server Actions.
 *
 * SCAFFOLD: every action here validates its input and returns. None of them
 * authenticates anyone, creates an account, sends an email or sets a session
 * cookie — there is no auth backend yet, and `middleware.ts` is a scaffold
 * whose redirect is deliberately commented out.
 *
 * Wire each marked section to the real provider (Auth.js / Supabase) together
 * with the transactional mail provider. Until then the forms demonstrate
 * validation, error handling and the success states, and nothing more.
 */

export type AuthState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field-level messages, keyed by input name. */
  errors?: Record<string, string>;
  /** Echoed back so the form can be repopulated after a failed submit. */
  values?: Record<string, string>;
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

  // TODO(backend): verify the credentials, set the session cookie, and
  // redirect to the `next` parameter or the dashboard.
  await new Promise((r) => setTimeout(r, 400));

  // DEVELOPMENT ONLY — demo accounts, so the portal can be walked without a
  // backend. Each address maps to a role; the password is ignored entirely.
  // Guarded on NODE_ENV rather than a comment, so a production build cannot
  // ship a login that accepts anything: there, this block does not exist and
  // the message below is what every attempt returns.
  if (process.env.NODE_ENV !== "production") {
    const role = DEMO_ACCOUNTS[parsed.data.email.trim().toLowerCase()];
    if (role) {
      cookies().set(ROLE_COOKIE, role, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      redirect("/dashboard");
    }
  }

  return {
    status: "error",
    message:
      "Sign-in is not available yet — the journal's account system is still being built. Nothing is wrong with what you entered.",
    values: safeValues(raw),
  };
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

  // TODO(backend): create the account, hash the password, and send the
  // verification email. Until then nothing is stored.
  await new Promise((r) => setTimeout(r, 500));

  return {
    status: "success",
    message:
      "Your details passed validation. Account creation is not live yet — no account has been created and no email has been sent.",
    // Carried so the success view can point at the verify-email page the way
    // the real flow will, once registration issues a verification link.
    values: { email: parsed.data.email },
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

  // TODO(backend): look up the address, mint a single-use token and email the
  // reset link. The response deliberately does not reveal whether an account
  // exists — that is an account-enumeration leak — so the success message is
  // the same either way once this is live.
  await new Promise((r) => setTimeout(r, 500));

  return {
    status: "success",
    message:
      "Password reset is not live yet, so no email has been sent. Once the account system is running, a reset link will arrive at this address if an account exists for it.",
  };
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

  // TODO(backend): verify the token has not expired or been used, hash and
  // store the new password, invalidate every existing session, and confirm
  // by email.
  await new Promise((r) => setTimeout(r, 500));

  return {
    status: "success",
    message:
      "Your new password passed validation. Password reset is not live yet, so nothing has been changed.",
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

  // TODO(backend): re-issue the verification token and send the email, rate
  // limited per address.
  await new Promise((r) => setTimeout(r, 500));

  return {
    status: "success",
    message:
      "Email verification is not live yet, so nothing has been sent. This is where the new link would go out.",
  };
}
