"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { FormNotice } from "@/components/ui/form-notice";
import { useFormFeedback } from "@/components/ui/use-form-feedback";
import { resendVerificationAction } from "../actions";
import type { FormState } from "../types";

const initialState: FormState = {};

export function ResendForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendVerificationAction, initialState);
  const formRef = useFormFeedback(state);

  // Start the countdown whenever the server answers (adjusting state while rendering is the
  // pattern React recommends for reacting to a changed value).
  const [seen, setSeen] = useState(state);
  const [secondsLeft, setSecondsLeft] = useState(0);
  if (state !== seen) {
    setSeen(state);
    setSecondsLeft(state.retryAfter ?? 0);
  }

  const counting = secondsLeft > 0;
  useEffect(() => {
    if (!counting) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [counting]);

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-4">
      {state.error ? <FormError>{state.error}</FormError> : null}
      {state.message ? <FormNotice>{state.message}</FormNotice> : null}
      <input type="hidden" name="email" value={email} />
      <Button
        type="submit"
        variant="secondary"
        loading={pending}
        disabled={counting}
        className="w-full"
      >
        {counting ? `Send again in ${secondsLeft}s` : "Send a new link"}
      </Button>
    </form>
  );
}
