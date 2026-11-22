import type { ButtonHTMLAttributes } from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background-color,transform,color] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-busy:disabled:opacity-100";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink hover:bg-accent/90",
  secondary: "border border-line bg-surface text-ink hover:bg-canvas",
  ghost: "text-muted hover:bg-surface hover:text-ink",
  danger: "bg-danger text-accent-ink hover:bg-danger/90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
};

type StyleOptions = { variant?: Variant; size?: Size; className?: string };

// Also usable on links: <Link className={buttonStyles({ variant: "secondary" })}>
export function buttonStyles({ variant = "primary", size = "md", className }: StyleOptions = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

function Spinner() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4 animate-spin">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path
        d="M17.25 10A7.25 7.25 0 0 0 10 2.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  Omit<StyleOptions, "className"> & { loading?: boolean };

export function Button({
  variant,
  size,
  className,
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
