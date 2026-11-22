import Link from "next/link";
import { Suspense } from "react";
import { z } from "zod";
import { env } from "@/core/env";
import { ResendForm } from "@/modules/auth/components/resend-form";

export const metadata = { title: "Check your email" };

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifyEmailContent({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email: rawEmail } = await searchParams;
  const parsed = z.string().email().max(254).safeParse(rawEmail);
  const email = parsed.success ? parsed.data : null;

  const devHint = env.NODE_ENV === "development" && !env.RESEND_API_KEY;

  return (
    <div className="stagger space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-muted text-sm">
          {email ? (
            <>
              We sent a confirmation link to <span className="text-ink font-medium">{email}</span>.
              Open it to finish setting up your account.
            </>
          ) : (
            "We sent you a confirmation link. Open it to finish setting up your account."
          )}
        </p>
        <p className="text-muted text-sm">
          Cannot find it? Check your spam folder. The link works for 24 hours.
        </p>
      </div>

      {devHint ? (
        <p className="rounded-control border-line bg-surface text-muted border px-3 py-2.5 text-sm">
          Development: no email provider is set, so the email is printed in the terminal running
          pnpm dev.
        </p>
      ) : null}

      {email ? <ResendForm email={email} /> : null}

      <p className="text-muted text-center text-sm">
        <Link href="/login" className="text-accent font-medium hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
