import "server-only";
import { resolveTimezone } from "./location";
import { createBusinessWithOwner, findMembershipsForUser } from "./repository";
import type { CreateBusinessInput } from "./schema";

export async function createBusiness(userId: string, input: CreateBusinessInput) {
  // The timezone is always worked out here, never taken from the browser.
  const timezone = resolveTimezone({
    country: input.country,
    latitude: input.latitude,
    longitude: input.longitude,
  });

  return createBusinessWithOwner(userId, {
    name: input.name,
    currency: input.currency,
    timezone,
    country: input.country,
    city: input.city,
  });
}

export async function userHasBusiness(userId: string) {
  const memberships = await findMembershipsForUser(userId);
  return memberships.length > 0;
}
