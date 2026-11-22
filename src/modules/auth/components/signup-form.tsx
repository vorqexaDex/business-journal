"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { signUpAction } from "../actions";
import type { FormState } from "../types";

const initialState: FormState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.error ? <FormError>{state.error}</FormError> : null}
      <Field
        label="Full name"
        name="name"
        type="text"
        autoComplete="name"
        placeholder="Your full name"
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name?.[0]}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@yourbusiness.com"
        defaultValue={state.values?.email}
        error={state.fieldErrors?.email?.[0]}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={state.fieldErrors?.password?.[0]}
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-muted text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-accent font-medium hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
