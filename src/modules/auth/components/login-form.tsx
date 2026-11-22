"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { useFormFeedback } from "@/components/ui/use-form-feedback";
import { signInAction } from "../actions";
import type { FormState } from "../types";

const initialState: FormState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);
  const formRef = useFormFeedback(state);

  return (
    <form ref={formRef} action={formAction} noValidate className="stagger space-y-5">
      {state.error ? <FormError>{state.error}</FormError> : null}
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
        autoComplete="current-password"
        placeholder="Your password"
        error={state.fieldErrors?.password?.[0]}
      />
      <Button type="submit" loading={pending} className="w-full">
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
