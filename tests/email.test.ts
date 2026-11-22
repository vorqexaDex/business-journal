import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockEnv = vi.hoisted(() => ({
  NODE_ENV: "test",
  EMAIL_FROM: "Test <test@example.com>",
  RESEND_API_KEY: undefined as string | undefined,
}));
vi.mock("@/core/env", () => ({ env: mockEnv }));

import { sendEmail } from "@/core/email/send";
import { verificationEmail } from "@/core/email/templates";

const mail = { to: "ada@example.com", subject: "Hello", html: "<p>Hi</p>", text: "Hi" };

describe("verification email template", () => {
  it("contains the link in both versions", () => {
    const { text, html } = verificationEmail({ name: "Ada Lovelace", url: "https://x.test/v?t=1" });
    expect(text).toContain("https://x.test/v?t=1");
    expect(html).toContain("https://x.test/v?t=1");
  });

  it("greets the first name only", () => {
    const { text } = verificationEmail({ name: "Ada Lovelace", url: "https://x.test" });
    expect(text).toContain("Hi Ada,");
  });

  it("escapes anything unsafe in the name and the link", () => {
    const { html } = verificationEmail({
      name: "<script>alert(1)</script>",
      url: 'https://x.test/?a="b"&c=d',
    });
    expect(html).not.toContain("<script>");
    expect(html).toContain("&quot;b&quot;");
    expect(html).toContain("&amp;c=d");
  });
});

describe("sendEmail", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    mockEnv.NODE_ENV = "test";
    mockEnv.RESEND_API_KEY = undefined;
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("does nothing, quietly, when no provider is set outside production", async () => {
    await expect(sendEmail(mail)).resolves.toBeUndefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refuses to drop mail in production without a key", async () => {
    mockEnv.NODE_ENV = "production";
    await expect(sendEmail(mail)).rejects.toThrow("RESEND_API_KEY");
  });

  it("sends through the provider when a key is set", async () => {
    mockEnv.RESEND_API_KEY = "re_test_key";
    fetchMock.mockResolvedValue({ ok: true, status: 200 });

    await sendEmail(mail);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test_key");
    expect(JSON.parse(init.body as string)).toMatchObject({
      from: "Test <test@example.com>",
      to: ["ada@example.com"],
      subject: "Hello",
    });
  });

  it("reports a provider failure without leaking the message body", async () => {
    mockEnv.RESEND_API_KEY = "re_test_key";
    fetchMock.mockResolvedValue({ ok: false, status: 422 });

    await expect(sendEmail(mail)).rejects.toThrow("status 422");
  });
});
