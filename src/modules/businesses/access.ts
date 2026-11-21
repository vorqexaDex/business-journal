import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/core/auth/session";
import { assertCan, type Action } from "@/core/auth/permissions";
import { getActiveBusinessId } from "./active-business";
import { findMembershipsForUser } from "./repository";

// Runs once per request, however many components call it.
const getBusinessContext = cache(async () => {
  const user = await requireUser();
  const memberships = await findMembershipsForUser(user.id);

  const first = memberships[0];
  if (!first) redirect("/onboarding");

  // The cookie must match one of THIS user's memberships, otherwise it is ignored.
  const activeId = await getActiveBusinessId();
  const membership = memberships.find((m) => m.businessId === activeId) ?? first;

  return { user, business: membership.business, role: membership.role };
});

export async function requireBusinessAccess(action?: Action) {
  const context = await getBusinessContext();
  if (action) assertCan(context.role, action);
  return context;
}
