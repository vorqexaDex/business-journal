"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
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
    <form action={formAction} className="space-y-5">
      <Field
        label="Business name"
        name="name"
        type="text"
        autoComplete="organization"
        placeholder="For example, Corner Market"
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
      {state.error ? <p className="text-danger text-sm">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Create business"}
      </Button>
    </form>
  );
}
