import type { ReactNode } from "react";

// Good news about a form, for example "A new link is on its way."
export function FormNotice({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      className="animate-menu-in rounded-control border-accent/30 bg-accent-soft text-accent flex items-start gap-2 border px-3 py-2.5 text-sm"
    >
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
        <path d="m6.9 10.2 2.2 2.2 4-4.4" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
