"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/core/auth/auth";
import { formValues } from "@/core/forms";
import { checkResendCooldown, markResent, RESEND_COOLDOWN_SECONDS } from "./resend-limit";
import { resendSchema, signInSchema, signUpSchema } from "./schema";
import type { FormState } from "./types";

const AFTER_VERIFY = "/dashboard";

function verifyPage(email: string) {
  return `/verify-email?email=${encodeURIComponent(email)}`;
}

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["password"]);

  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }

  try {
    // The account is created and a confirmation email is sent. No session yet.
    await auth.api.signUpEmail({ body: { ...parsed.data, callbackURL: AFTER_VERIFY } });
  } catch (error) {
    if (error instanceof APIError) return { error: error.message, values };
    throw error;
  }

  markResent(parsed.data.email);

  // Same page whether the email is new or already registered, so nobody can probe for accounts.
  // redirect() works by throwing, so it must stay outside the try/catch.
  redirect(verifyPage(parsed.data.email));
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["password"]);

  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors, values };
  }

  let unverified = false;

  try {
    await auth.api.signInEmail({ body: { ...parsed.data, callbackURL: AFTER_VERIFY } });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;

    // This only happens after the password was correct, so it reveals nothing to strangers.
    // Better Auth has already sent a fresh confirmation link.
    if (error.body?.code === "EMAIL_NOT_VERIFIED") {
      unverified = true;
    } else {
      // Same message for "no such user" and "wrong password".
      return { error: "Incorrect email or password.", values };
    }
  }

  if (unverified) {
    markResent(parsed.data.email);
    redirect(verifyPage(parsed.data.email));
  }

  redirect(AFTER_VERIFY);
}

export async function resendVerificationAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resendSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "Enter a valid email address." };

  const { email } = parsed.data;

  const wait = checkResendCooldown(email);
  if (wait > 0) {
    return {
      error: `Please wait ${wait} seconds before asking for another email.`,
      retryAfter: wait,
    };
  }
  markResent(email);

  try {
    await auth.api.sendVerificationEmail({ body: { email, callbackURL: AFTER_VERIFY } });
  } catch {
    // Same answer whether or not the address has an account, or is already confirmed.
  }

  return {
    message: "If that address has an account, a new link is on its way.",
    retryAfter: RESEND_COOLDOWN_SECONDS,
  };
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
