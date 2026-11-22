import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { db } from "@/core/db/client";
import { createBusinessSchema } from "@/modules/businesses/schema";
import { createBusiness } from "@/modules/businesses/service";
import { createUser, resetDb } from "./helpers/db";

// Form values arrive as text, exactly like a browser form.
const valid = {
  name: "Corner Market",
  country: "GB",
  city: "London",
  latitude: "51.5074",
  longitude: "-0.1278",
  currency: "GBP",
};

describe("create business input", () => {
  it("accepts a valid form and reads coordinates from text", () => {
    const parsed = createBusinessSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.latitude).toBeCloseTo(51.5074);
  });

  it("treats empty coordinates as missing", () => {
    const parsed = createBusinessSchema.safeParse({ ...valid, latitude: "", longitude: "" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.latitude).toBeUndefined();
  });

  it("rejects an unknown country", () => {
    expect(createBusinessSchema.safeParse({ ...valid, country: "XX" }).success).toBe(false);
  });

  it("rejects an unknown currency", () => {
    expect(createBusinessSchema.safeParse({ ...valid, currency: "ZZZ" }).success).toBe(false);
  });

  it("rejects out-of-range coordinates", () => {
    expect(createBusinessSchema.safeParse({ ...valid, latitude: "999" }).success).toBe(false);
  });

  it("ignores a timezone sent by the browser", () => {
    const parsed = createBusinessSchema.parse({ ...valid, timezone: "Asia/Tokyo" });
    expect(parsed).not.toHaveProperty("timezone");
  });
});

describe("createBusiness", () => {
  beforeEach(resetDb);
  afterAll(() => db.$disconnect());

  it("works out the timezone on the server and makes the user the owner", async () => {
    const user = await createUser();
    const business = await createBusiness(user.id, createBusinessSchema.parse(valid));

    const saved = await db.business.findUniqueOrThrow({
      where: { id: business.id },
      include: { memberships: true },
    });

    expect(saved.timezone).toBe("Europe/London");
    expect(saved.country).toBe("GB");
    expect(saved.city).toBe("London");
    expect(saved.memberships).toEqual([
      expect.objectContaining({ userId: user.id, role: "OWNER" }),
    ]);
  });

  it("uses the country timezone when the city was typed by hand", async () => {
    const user = await createUser();
    const input = createBusinessSchema.parse({ ...valid, latitude: "", longitude: "" });
    const business = await createBusiness(user.id, input);

    const saved = await db.business.findUniqueOrThrow({ where: { id: business.id } });
    expect(saved.timezone).toBe("Europe/London");
  });

  it("does not trust coordinates from a different country", async () => {
    const user = await createUser();
    // Tokyo coordinates with country GB must never produce Asia/Tokyo.
    const input = createBusinessSchema.parse({ ...valid, latitude: "35.68", longitude: "139.69" });
    const business = await createBusiness(user.id, input);

    const saved = await db.business.findUniqueOrThrow({ where: { id: business.id } });
    expect(saved.timezone).toBe("Europe/London");
  });
});
