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
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-ink text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required
        defaultValue=""
        aria-invalid={error ? true : undefined}
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
      {error ? <p className="text-danger text-sm">{error}</p> : null}
    </div>
  );
}
