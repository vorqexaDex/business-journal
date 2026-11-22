// Vibration feedback. Works on Android browsers; iPhones and desktops simply do nothing.
type Pattern = "tap" | "success" | "error";

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 8,
  success: [10, 40, 14],
  error: [24, 36, 24, 36, 40],
};

const STORAGE_KEY = "bj:haptics";

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// On by default. A Settings toggle will call setHapticsEnabled later.
export function hapticsEnabled() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

export function setHapticsEnabled(enabled: boolean) {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Storage can be blocked. The preference just will not be remembered.
  }
}

export function haptic(kind: Pattern) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  if (prefersReducedMotion() || !hapticsEnabled()) return;
  navigator.vibrate(PATTERNS[kind]);
}
