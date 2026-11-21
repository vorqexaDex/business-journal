"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { APIError } from "better-auth/api";
import { auth } from "@/core/auth/auth";
import { signInSchema, signUpSchema } from "./schema";
import type { FormState } from "./types";

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await auth.api.signUpEmail({ body: parsed.data });
  } catch (error) {
    if (error instanceof APIError) return { error: error.message };
    throw error;
  }

  // redirect() works by throwing, so it must stay outside the try/catch.
  redirect("/dashboard");
}

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    await auth.api.signInEmail({ body: parsed.data });
  } catch (error) {
    if (error instanceof APIError) {
      // Same message for "no such user" and "wrong password", so attackers can't probe for accounts.
      return { error: "Incorrect email or password." };
    }
    throw error;
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/login");
}
