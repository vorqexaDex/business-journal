import { cn } from "./cn";

// A grey placeholder shown while data loads.
export function Skeleton({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("rounded-control bg-line animate-pulse", className)} />
  );
}
