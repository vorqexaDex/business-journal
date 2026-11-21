type FieldProps = {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  error?: string;
};

export function Field({ label, name, type, autoComplete, error }: FieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={error ? true : undefined}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
