import type { Role } from "@/generated/prisma/enums";
import { ForbiddenError } from "@/core/errors";

const ALL_ACTIONS = [
  "business:update",
  "member:manage",
  "product:read",
  "product:write",
  "stock:adjust",
  "sale:create",
  "sale:void",
  "expense:write",
  "report:view",
] as const;

export type Action = (typeof ALL_ACTIONS)[number];

const permissions: Record<Role, readonly Action[]> = {
  OWNER: ALL_ACTIONS,
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

export function can(role: Role, action: Action): boolean {
  return permissions[role].includes(action);
}

export function assertCan(role: Role, action: Action): void {
  if (!can(role, action)) throw new ForbiddenError();
}
