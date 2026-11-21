import "server-only";
import { createBusinessWithOwner, findMembershipsForUser } from "./repository";
import type { CreateBusinessInput } from "./schema";

export async function createBusiness(userId: string, input: CreateBusinessInput) {
  return createBusinessWithOwner(userId, input);
}

export async function userHasBusiness(userId: string) {
  const memberships = await findMembershipsForUser(userId);
  return memberships.length > 0;
}
