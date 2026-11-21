import { Suspense, type ReactNode } from "react";
import { requireUser } from "@/core/auth/session";
import { signOutAction } from "@/modules/auth/actions";

// Everything in this area depends on who is signed in, so it cannot be prerendered
// or cached. This opts the section out of Next.js's instant-navigation dev check.
export const instant = false;

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-neutral-500">Loading…</p>}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}

// Runs on the server for every request. Signed-out visitors are redirected to /login.
async function AuthGate({ children }: { children: ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between border-b border-neutral-200 px-6 py-3 dark:border-neutral-800">
        <span className="font-semibold">Business Journal</span>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-neutral-600 dark:text-neutral-400">{user.name}</span>
          <form action={signOutAction}>
            <button type="submit" className="font-medium underline">
              Sign out
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
