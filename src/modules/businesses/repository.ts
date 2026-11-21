import "server-only";
import { db } from "@/core/db/client";
import type { CreateBusinessInput } from "./schema";

// Always keyed by userId: a user can only ever see their own memberships.
export function findMembershipsForUser(userId: string) {
  return db.membership.findMany({
    where: { userId, business: { deletedAt: null } },
    select: {
      businessId: true,
      role: true,
      business: { select: { id: true, name: true, currency: true, timezone: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

// The business and its OWNER membership are created together or not at all.
export function createBusinessWithOwner(userId: string, data: CreateBusinessInput) {
  return db.business.create({
    data: {
      ...data,
      memberships: { create: { userId, role: "OWNER" } },
    },
    select: { id: true },
  });
}
