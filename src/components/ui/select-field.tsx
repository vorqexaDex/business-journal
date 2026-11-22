import type { ChangeEvent } from "react";
import { FieldError } from "./form-error";

type Option = { value: string; label: string };

type SelectFieldProps = {
  label: string;
  name: string;
  options: Option[];
  placeholder: string;
  error?: string;
  helper?: string;
  value?: string;
  onChange?: (value: string) => void;
};

export function SelectField({
  label,
  name,
  options,
  placeholder,
  error,
  helper,
  value,
  onChange,
}: SelectFieldProps) {
  const controlled = value !== undefined;
  const errorId = `${name}-error`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-ink text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        {...(controlled
          ? {
              value,
              onChange: (event: ChangeEvent<HTMLSelectElement>) => onChange?.(event.target.value),
            }
          : { defaultValue: "" })}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="rounded-control border-line bg-surface text-ink aria-[invalid=true]:border-danger focus:border-accent w-full border px-3 py-2.5 text-sm"
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? (
        <FieldError id={errorId}>{error}</FieldError>
      ) : helper ? (
        <p className="text-muted text-sm">{helper}</p>
      ) : null}
    </div>
  );
}
