import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

// React's cache() only works inside Next.js. In tests it just calls the function,
// which also stops results from leaking from one test to the next.
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return { ...actual, cache: <T>(fn: T) => fn };
});

// In Next.js, redirect() throws. We throw a readable error so tests can check where it went.
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

// The two inputs an attacker controls: who is signed in, and the cookie value.
vi.mock("@/core/auth/session", () => ({ requireUser: vi.fn() }));
vi.mock("@/modules/businesses/active-business", () => ({ getActiveBusinessId: vi.fn() }));

import { requireUser } from "@/core/auth/session";
import { db } from "@/core/db/client";
import { ForbiddenError } from "@/core/errors";
import { requireBusinessAccess } from "@/modules/businesses/access";
import { getActiveBusinessId } from "@/modules/businesses/active-business";
import { findMembershipsForUser } from "@/modules/businesses/repository";
import { createBusinessFor, createUser, resetDb } from "./helpers/db";

type SessionUser = Awaited<ReturnType<typeof requireUser>>;

function signInAs(user: { id: string }) {
  vi.mocked(requireUser).mockResolvedValue(user as SessionUser);
}

function setCookie(businessId: string | undefined) {
  vi.mocked(getActiveBusinessId).mockResolvedValue(businessId);
}

describe("tenant isolation", () => {
  beforeEach(async () => {
    await resetDb();
    setCookie(undefined);
  });

  afterAll(() => db.$disconnect());

  it("gives a user their own business", async () => {
    const alice = await createUser("Alice");
    const shopA = await createBusinessFor(alice.id, "OWNER", "Shop A");
    signInAs(alice);

    const { business, role } = await requireBusinessAccess();

    expect(business.id).toBe(shopA.id);
    expect(role).toBe("OWNER");
  });

  it("never lets a user see another user's business in their memberships", async () => {
    const alice = await createUser("Alice");
    const bob = await createUser("Bob");
    const shopA = await createBusinessFor(alice.id, "OWNER", "Shop A");
    const shopB = await createBusinessFor(bob.id, "OWNER", "Shop B");

    const aliceIds = (await findMembershipsForUser(alice.id)).map((m) => m.businessId);
    const bobIds = (await findMembershipsForUser(bob.id)).map((m) => m.businessId);

    expect(aliceIds).toEqual([shopA.id]);
    expect(bobIds).toEqual([shopB.id]);
  });

  it("ignores a forged business cookie pointing at someone else's business", async () => {
    const alice = await createUser("Alice");
    const bob = await createUser("Bob");
    const shopA = await createBusinessFor(alice.id, "OWNER", "Shop A");
    const shopB = await createBusinessFor(bob.id, "OWNER", "Shop B");

    signInAs(alice);
    setCookie(shopB.id); // Alice edits her cookie to Bob's business id

    const { business } = await requireBusinessAccess();

    expect(business.id).toBe(shopA.id);
    expect(business.id).not.toBe(shopB.id);
  });

  it("ignores a cookie containing garbage", async () => {
    const alice = await createUser("Alice");
    const shopA = await createBusinessFor(alice.id, "OWNER", "Shop A");

    signInAs(alice);
    setCookie("not-a-real-id'; DROP TABLE business; --");

    const { business } = await requireBusinessAccess();

    expect(business.id).toBe(shopA.id);
  });

  it("lets a user switch between businesses they really belong to", async () => {
    const alice = await createUser("Alice");
    await createBusinessFor(alice.id, "OWNER", "Shop A");
    const shopC = await createBusinessFor(alice.id, "OWNER", "Shop C");

    signInAs(alice);
    setCookie(shopC.id);

    const { business } = await requireBusinessAccess();

    expect(business.id).toBe(shopC.id);
  });

  it("applies the role of the active business, not a global role", async () => {
    const alice = await createUser("Alice");
    const shopA = await createBusinessFor(alice.id, "OWNER", "Shop A");
    const shopC = await createBusinessFor(alice.id, "CASHIER", "Shop C");
    signInAs(alice);

    setCookie(shopA.id);
    await expect(requireBusinessAccess("sale:void")).resolves.toMatchObject({ role: "OWNER" });

    setCookie(shopC.id);
    await expect(requireBusinessAccess("sale:void")).rejects.toThrow(ForbiddenError);
    await expect(requireBusinessAccess("sale:create")).resolves.toMatchObject({ role: "CASHIER" });
  });

  it("sends a user with no business to onboarding", async () => {
    const carol = await createUser("Carol");
    signInAs(carol);

    await expect(requireBusinessAccess()).rejects.toThrow("REDIRECT:/onboarding");
  });

  it("does not give access to a soft-deleted business", async () => {
    const alice = await createUser("Alice");
    const shopA = await createBusinessFor(alice.id, "OWNER", "Shop A");
    await db.business.update({ where: { id: shopA.id }, data: { deletedAt: new Date() } });

    signInAs(alice);
    setCookie(shopA.id);

    await expect(requireBusinessAccess()).rejects.toThrow("REDIRECT:/onboarding");
  });

  it("blocks signed-out visitors", async () => {
    vi.mocked(requireUser).mockRejectedValue(new Error("REDIRECT:/login"));

    await expect(requireBusinessAccess()).rejects.toThrow("REDIRECT:/login");
  });
});
