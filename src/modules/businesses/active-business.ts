import "server-only";
import { cookies } from "next/headers";
import { env } from "@/core/env";

const COOKIE_NAME = "bj_business";

// This cookie is only a HINT about which business to show.
// It is never trusted: access.ts checks it against the user's real memberships.
export async function getActiveBusinessId() {
  return (await cookies()).get(COOKIE_NAME)?.value;
}

export async function setActiveBusinessId(businessId: string) {
  (await cookies()).set(COOKIE_NAME, businessId, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
