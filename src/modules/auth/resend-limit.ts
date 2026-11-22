// A simple cooldown so nobody can flood an inbox through the "send again" button.
// It lives in memory, so it protects one server only. Phase 8 replaces it with a shared
// rate limiter (Redis) for production.
const COOLDOWN_MS = 60_000;
const lastSent = new Map<string, number>();

// Returns how many seconds are left to wait, or 0 if sending is allowed.
export function checkResendCooldown(email: string, now = Date.now()): number {
  for (const [key, at] of lastSent) {
    if (now - at >= COOLDOWN_MS) lastSent.delete(key);
  }
  const at = lastSent.get(email.toLowerCase());
  if (at === undefined) return 0;
  return Math.ceil((COOLDOWN_MS - (now - at)) / 1000);
}

export function markResent(email: string, now = Date.now()) {
  lastSent.set(email.toLowerCase(), now);
}

export const RESEND_COOLDOWN_SECONDS = COOLDOWN_MS / 1000;
