import "server-only";
import { env } from "@/core/env";

export type Email = { to: string; subject: string; html: string; text: string };

export async function sendEmail(email: Email): Promise<void> {
  if (!env.RESEND_API_KEY) {
    // Never silently drop mail in production.
    if (env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set, so email cannot be sent.");
    }
    // Development: show the email in the terminal so you can click the link.
    if (env.NODE_ENV === "development") {
      console.info(
        `\n──── Email (not sent, no RESEND_API_KEY) ────\nTo: ${email.to}\nSubject: ${email.subject}\n\n${email.text}\n─────────────────────────────────────────────\n`,
      );
    }
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [email.to],
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  // Log only the status. The body of the mail contains a secret link.
  if (!response.ok) {
    throw new Error(`Email provider rejected the message (status ${response.status}).`);
  }
}
