"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "../actions";
import type { FormState } from "../types";
import { Field } from "./field";

const initialState: FormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email?.[0]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password?.[0]}
      />
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        New here?{" "}
        <Link href="/signup" className="font-medium underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
