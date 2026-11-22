import { describe, expect, it } from "vitest";
import { checkResendCooldown, markResent } from "@/modules/auth/resend-limit";

describe("resend cooldown", () => {
  it("allows the first send", () => {
    expect(checkResendCooldown("first@example.com", 1_000)).toBe(0);
  });

  it("makes the user wait, and says how long", () => {
    markResent("wait@example.com", 0);
    expect(checkResendCooldown("wait@example.com", 20_000)).toBe(40);
  });

  it("allows another send once a minute has passed", () => {
    markResent("later@example.com", 0);
    expect(checkResendCooldown("later@example.com", 60_000)).toBe(0);
  });

  it("treats upper and lower case as the same address", () => {
    markResent("Case@Example.com", 0);
    expect(checkResendCooldown("case@example.com", 10_000)).toBeGreaterThan(0);
  });

  it("does not make one person wait because of another", () => {
    markResent("a@example.com", 0);
    expect(checkResendCooldown("b@example.com", 1_000)).toBe(0);
  });
});
