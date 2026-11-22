import { describe, expect, it } from "vitest";
import {
  isValidCountry,
  listCountries,
  resolveTimezone,
  searchCities,
} from "@/modules/businesses/location";

describe("country list", () => {
  it("includes every country with its currency", () => {
    const countries = listCountries();
    expect(countries.length).toBeGreaterThan(200);
    expect(countries.find((c) => c.code === "GB")?.currency).toBe("GBP");
  });

  it("accepts real country codes and rejects anything else", () => {
    expect(isValidCountry("GB")).toBe(true);
    expect(isValidCountry("XX")).toBe(false);
    expect(isValidCountry("gb")).toBe(false);
    expect(isValidCountry("'; DROP TABLE business; --")).toBe(false);
  });
});

describe("city search", () => {
  it("finds cities by prefix, ignoring case", () => {
    const names = searchCities("GB", "lond").map((c) => c.name);
    expect(names).toContain("London");
  });

  it("returns nothing for very short queries", () => {
    expect(searchCities("GB", "l")).toEqual([]);
  });

  it("returns nothing for an unknown country", () => {
    expect(searchCities("XX", "london")).toEqual([]);
  });

  it("never returns more than the limit", () => {
    expect(searchCities("US", "san", 5).length).toBeLessThanOrEqual(5);
  });
});

describe("timezone resolution", () => {
  it("maps city coordinates to the right timezone", () => {
    expect(resolveTimezone({ country: "GB", latitude: 51.5074, longitude: -0.1278 })).toBe(
      "Europe/London",
    );
    expect(resolveTimezone({ country: "NG", latitude: 6.5244, longitude: 3.3792 })).toBe(
      "Africa/Lagos",
    );
  });

  it("tells apart timezones inside one country", () => {
    expect(resolveTimezone({ country: "US", latitude: 40.7128, longitude: -74.006 })).toBe(
      "America/New_York",
    );
    expect(resolveTimezone({ country: "US", latitude: 34.0522, longitude: -118.2437 })).toBe(
      "America/Los_Angeles",
    );
  });

  it("falls back to the country timezone when coordinates are missing", () => {
    expect(resolveTimezone({ country: "GB" })).toBe("Europe/London");
  });

  it("ignores coordinates that belong to a different country", () => {
    // Tokyo coordinates sent with country GB must not produce Asia/Tokyo.
    expect(resolveTimezone({ country: "GB", latitude: 35.68, longitude: 139.69 })).toBe(
      "Europe/London",
    );
  });

  it("survives out-of-range coordinates", () => {
    expect(resolveTimezone({ country: "GB", latitude: 999, longitude: 999 })).toBe("Europe/London");
  });
});
