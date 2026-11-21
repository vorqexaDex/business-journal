"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import type { FormState } from "@/core/forms";
import { createBusinessAction } from "../actions";

type Option = { value: string; label: string };

const initialState: FormState = {};

export function CreateBusinessForm({
  currencies,
  timezones,
}: {
  currencies: Option[];
  timezones: Option[];
}) {
  const [state, formAction, pending] = useActionState(createBusinessAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <Field
        label="Business name"
        name="name"
        type="text"
        autoComplete="organization"
        error={state.fieldErrors?.name?.[0]}
      />
      <SelectField
        label="Currency"
        name="currency"
        placeholder="Select your currency"
        options={currencies}
        error={state.fieldErrors?.currency?.[0]}
      />
      <SelectField
        label="Timezone"
        name="timezone"
        placeholder="Select your timezone"
        options={timezones}
        error={state.fieldErrors?.timezone?.[0]}
      />
      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-white dark:text-neutral-900"
      >
        {pending ? "Creating…" : "Create business"}
      </button>
    </form>
  );
}
