import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/core/db/client";
import { createBusinessFor, createUser, resetDb } from "./helpers/db";

describe("test setup", () => {
  beforeEach(resetDb);
  afterAll(() => db.$disconnect());

  it("talks to the test database and creates an owner membership", async () => {
    const user = await createUser();
    const business = await createBusinessFor(user.id, "OWNER");

    const memberships = await db.membership.findMany({ where: { userId: user.id } });

    expect(memberships).toHaveLength(1);
    expect(memberships[0]?.businessId).toBe(business.id);
    expect(memberships[0]?.role).toBe("OWNER");
  });
});
