type FieldProps = {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  placeholder?: string;
  error?: string;
};

export function Field({ label, name, type, autoComplete, placeholder, error }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-ink text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        aria-invalid={error ? true : undefined}
        className="rounded-control border-line bg-surface text-ink placeholder:text-muted/70 aria-[invalid=true]:border-danger focus:border-accent w-full border px-3 py-2.5 text-sm"
      />
      {error ? <p className="text-danger text-sm">{error}</p> : null}
    </div>
  );
}
