import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/core/db/client";
import { sendEmail } from "@/core/email/send";
import { verificationEmail } from "@/core/email/templates";
import { env } from "@/core/env";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    // Nobody can log in until they have confirmed their email.
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60 * 24, // the link works for 24 hours
    sendVerificationEmail: async ({ user, url }) => {
      // Deliberately not awaited: waiting would make "new account" and "existing account"
      // take different amounts of time, which could reveal whether an email is registered.
      // At deploy time we move this to a background task that survives serverless freezing.
      void sendEmail({ to: user.email, ...verificationEmail({ name: user.name, url }) }).catch(
        (error: unknown) => {
          console.error("Could not send the verification email:", error);
        },
      );
    },
  },
  // Must stay last: lets server actions set auth cookies.
  plugins: [nextCookies()],
});
