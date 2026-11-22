"use client";

import { useEffect } from "react";
import { haptic } from "@/core/haptics";

const TARGETS = 'button, [role="option"], [role="tab"], [role="menuitem"], [data-haptic="tap"]';
const SKIP = ':disabled, [aria-disabled="true"], [data-haptic="off"]';

export function HapticsListener() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as Element | null)?.closest<HTMLElement>(TARGETS);
      if (!target || target.matches(SKIP)) return;
      haptic("tap");
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
