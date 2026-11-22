"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { FormState } from "../types";
import { signInAction } from "../actions";

const initialState: FormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@yourbusiness.com"
        error={state.fieldErrors?.email?.[0]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        error={state.fieldErrors?.password?.[0]}
      />
      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>
      <p className="text-muted text-center text-sm">
        New here?{" "}
        <Link href="/signup" className="text-accent font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
