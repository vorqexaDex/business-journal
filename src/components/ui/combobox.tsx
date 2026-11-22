"use client";

import { useId, useState, type KeyboardEvent } from "react";
import { cn } from "./cn";

export type ComboboxOption = { key: string; label: string; hint?: string };

type ComboboxProps = {
  label: string;
  placeholder: string;
  query: string;
  onQueryChange: (query: string) => void;
  options: ComboboxOption[];
  onSelect: (option: ComboboxOption) => void;
  loading?: boolean;
  disabled?: boolean;
  helper?: string;
  error?: string;
};

export function Combobox({
  label,
  placeholder,
  query,
  onQueryChange,
  options,
  onSelect,
  loading = false,
  disabled = false,
  helper,
  error,
}: ComboboxProps) {
  const id = useId();
  const listId = `${id}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const activeIndex = Math.min(active, Math.max(options.length - 1, 0));
  const expanded = open && (loading || options.length > 0);

  function choose(option: ComboboxOption) {
    onSelect(option);
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive(Math.min(activeIndex + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter" && expanded && options[activeIndex]) {
      event.preventDefault();
      choose(options[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div
      className="space-y-1.5"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <label htmlFor={id} className="text-ink text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            expanded && options[activeIndex] ? `${id}-option-${activeIndex}` : undefined
          }
          aria-invalid={error ? true : undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={query}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className="rounded-control border-line bg-surface text-ink placeholder:text-muted/70 focus:border-accent aria-[invalid=true]:border-danger w-full border py-2.5 pr-9 pl-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        />

        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>

        {expanded ? (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="animate-menu-in rounded-control border-line bg-surface absolute z-20 mt-2 max-h-64 w-full overflow-auto border p-1 shadow-xl shadow-black/50"
          >
            {loading ? (
              <li role="presentation" className="text-muted px-3 py-2 text-sm">
                Searching…
              </li>
            ) : null}

            {options.map((option, index) => (
              <li
                key={option.key}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
                onMouseEnter={() => setActive(index)}
                ref={(element) => {
                  if (element && index === activeIndex)
                    element.scrollIntoView({ block: "nearest" });
                }}
                className={cn(
                  "text-ink flex cursor-pointer items-baseline justify-between gap-3 rounded-md px-3 py-2 text-sm",
                  index === activeIndex && "bg-white/5",
                )}
              >
                <span className="truncate">{option.label}</span>
                {option.hint ? (
                  <span className="text-muted shrink-0 text-xs">{option.hint}</span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {error ? (
        <p className="text-danger text-sm">{error}</p>
      ) : helper ? (
        <p className="text-muted text-sm">{helper}</p>
      ) : null}
    </div>
  );
}
