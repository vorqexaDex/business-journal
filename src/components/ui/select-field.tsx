type Option = { value: string; label: string };

type SelectFieldProps = {
  label: string;
  name: string;
  options: Option[];
  placeholder: string;
  error?: string;
};

export function SelectField({ label, name, options, placeholder, error }: SelectFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        defaultValue=""
        aria-invalid={error ? true : undefined}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
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
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
