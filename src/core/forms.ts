export type FormState = {
  error?: string;
  // A friendly confirmation, for example "A new link is on its way."
  message?: string;
  // Seconds the user must wait before trying again.
  retryAfter?: number;
  fieldErrors?: Record<string, string[] | undefined>;
  // What the user typed, sent back so the form does not wipe their input.
  values?: Record<string, string>;
};

// Collects submitted text fields so they can be shown again after an error.
// Fields listed in `omit` (such as passwords) are never sent back.
export function formValues(formData: FormData, omit: string[] = []): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$") && !omit.includes(key)) {
      values[key] = value;
    }
  }
  return values;
}
