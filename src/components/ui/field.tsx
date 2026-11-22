import { FieldError } from "./form-error";

type FieldProps = {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  placeholder?: string;
  defaultValue?: string;
  error?: string;
};

export function Field({
  label,
  name,
  type,
  autoComplete,
  placeholder,
  defaultValue,
  error,
}: FieldProps) {
  const errorId = `${name}-error`;

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
        defaultValue={defaultValue}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="rounded-control border-line bg-surface text-ink placeholder:text-muted/70 aria-[invalid=true]:border-danger focus:border-accent w-full border px-3 py-2.5 text-sm"
      />
      {error ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
