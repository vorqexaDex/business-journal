import { randomUUID } from "node:crypto";
import { db } from "@/core/db/client";
import type { Role } from "@/generated/prisma/enums";

// Wipes every table so each test starts from nothing.
export async function resetDb() {
  await db.$executeRawUnsafe(
    'TRUNCATE TABLE "membership", "business", "session", "account", "verification", "user" CASCADE',
  );
}

export async function createUser(name = "Test User") {
  const now = new Date();
  return db.user.create({
    data: {
      id: randomUUID(),
      name,
      email: `user-${randomUUID()}@test.local`,
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  });
}

// Creates a business and gives the user a membership with the given role.
export async function createBusinessFor(
  userId: string,
  role: Role = "OWNER",
  name = "Test Business",
) {
  return db.business.create({
    data: {
      name,
      currency: "USD",
      timezone: "UTC",
      memberships: { create: { userId, role } },
    },
  });
}

export async function addMember(businessId: string, userId: string, role: Role) {
  return db.membership.create({ data: { businessId, userId, role } });
}
