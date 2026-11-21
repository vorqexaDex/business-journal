import { describe, expect, it } from "vitest";
import { ALL_ACTIONS, assertCan, can, type Action } from "@/core/auth/permissions";
import { ForbiddenError } from "@/core/errors";

// The expected matrix, written out by hand. If someone changes a role's
// permissions in the code, these tests fail until the change is deliberate.
const expected: Record<"OWNER" | "MANAGER" | "CASHIER", Action[]> = {
  OWNER: [...ALL_ACTIONS],
  MANAGER: [
    "product:read",
    "product:write",
    "stock:adjust",
    "sale:create",
    "sale:void",
    "expense:write",
    "report:view",
  ],
  CASHIER: ["product:read", "sale:create"],
};

describe("permission matrix", () => {
  for (const role of ["OWNER", "MANAGER", "CASHIER"] as const) {
    it(`${role} can do exactly the allowed actions and nothing else`, () => {
      for (const action of ALL_ACTIONS) {
        expect(can(role, action), `${role} -> ${action}`).toBe(expected[role].includes(action));
      }
    });
  }

  it("only the owner can update the business or manage members", () => {
    expect(can("OWNER", "business:update")).toBe(true);
    expect(can("OWNER", "member:manage")).toBe(true);

    for (const role of ["MANAGER", "CASHIER"] as const) {
      expect(can(role, "business:update")).toBe(false);
      expect(can(role, "member:manage")).toBe(false);
    }
  });

  it("a cashier can sell but cannot void sales, adjust stock, or see reports", () => {
    expect(can("CASHIER", "sale:create")).toBe(true);
    expect(can("CASHIER", "sale:void")).toBe(false);
    expect(can("CASHIER", "stock:adjust")).toBe(false);
    expect(can("CASHIER", "report:view")).toBe(false);
    expect(can("CASHIER", "expense:write")).toBe(false);
  });
});

describe("assertCan", () => {
  it("does nothing when the role is allowed", () => {
    expect(() => assertCan("MANAGER", "sale:void")).not.toThrow();
  });

  it("throws a ForbiddenError (HTTP 403) when the role is not allowed", () => {
    expect(() => assertCan("CASHIER", "sale:void")).toThrow(ForbiddenError);

    try {
      assertCan("CASHIER", "sale:void");
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenError);
      expect((error as ForbiddenError).status).toBe(403);
    }
  });
});
