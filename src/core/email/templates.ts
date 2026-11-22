function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function verificationEmail({ name, url }: { name: string; url: string }) {
  const firstName = name.trim().split(/\s+/)[0] || "there";
  const safeName = escapeHtml(firstName);
  const safeUrl = escapeHtml(url);

  const subject = "Confirm your email for Business Journal";

  const text = [
    `Hi ${firstName},`,
    "",
    "Confirm your email address to finish creating your Business Journal account:",
    "",
    url,
    "",
    "This link works for 24 hours. If you did not create an account, you can ignore this email.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#0a0a0a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#141414;border:1px solid #262626;border-radius:14px;">
            <tr>
              <td style="padding:32px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ededed;">
                <p style="margin:0 0 4px;font-size:14px;color:#a1a1a1;">Business Journal</p>
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:600;color:#ededed;">Confirm your email</h1>
                <p style="margin:0;font-size:15px;line-height:1.6;color:#ededed;">Hi ${safeName}, confirm your email address to finish creating your account.</p>
                <p style="margin:24px 0;">
                  <a href="${safeUrl}" style="display:inline-block;background:#4fb39d;color:#06130f;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:999px;">Confirm email</a>
                </p>
                <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#a1a1a1;">Or paste this link into your browser:<br /><span style="word-break:break-all;color:#ededed;">${safeUrl}</span></p>
                <p style="margin:0;font-size:13px;line-height:1.6;color:#a1a1a1;">This link works for 24 hours. If you did not create an account, you can ignore this email.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}
