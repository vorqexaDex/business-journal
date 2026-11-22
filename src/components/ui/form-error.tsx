import type { ReactNode } from "react";

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-0.5 h-4 w-4 shrink-0"
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.5v4" />
      <path d="M10 13.4h.01" />
    </svg>
  );
}

// A message under a single field.
export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="animate-menu-in text-danger flex items-start gap-1.5 text-sm">
      <AlertIcon />
      <span>{children}</span>
    </p>
  );
}

// A message about the whole form, for example "Incorrect email or password."
export function FormError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="animate-menu-in rounded-control border-danger/30 bg-danger-soft text-danger flex items-start gap-2 border px-3 py-2.5 text-sm"
    >
      <AlertIcon />
      <span>{children}</span>
    </div>
  );
}
