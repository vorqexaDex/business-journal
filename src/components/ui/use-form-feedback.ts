import { useEffect, useRef } from "react";
import type { FormState } from "@/core/forms";
import { haptic, prefersReducedMotion } from "@/core/haptics";

const SHAKE = [
  { transform: "translateX(0)" },
  { transform: "translateX(-6px)" },
  { transform: "translateX(5px)" },
  { transform: "translateX(-4px)" },
  { transform: "translateX(3px)" },
  { transform: "translateX(0)" },
];

// Attach the returned ref to a <form>. Every failed submit gets felt and shown.
export function useFormFeedback(state: FormState) {
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const failed =
      Boolean(state.error) || Object.values(state.fieldErrors ?? {}).some((m) => m && m.length > 0);
    if (!failed) return;

    haptic("error");

    if (!prefersReducedMotion()) {
      ref.current?.animate(SHAKE, { duration: 360, easing: "ease-in-out" });
    }

    // Browser bubbles are off, so move the cursor to the first problem ourselves.
    ref.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  return ref;
}
