import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/core/auth/auth";

// cache() makes this run once per request, even if several components call it.
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

// Use in any protected page, layout or action. Redirects if signed out.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
