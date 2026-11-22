import "server-only";
import tzlookup from "@photostructure/tz-lookup";
import { City, Country, State } from "country-state-city";

export type CountryOption = { code: string; name: string; currency: string };
export type CityResult = {
  name: string;
  region: string | null;
  latitude: number;
  longitude: number;
};

type IndexedCity = CityResult & { key: string };

let countryCache: CountryOption[] | undefined;
const cityIndex = new Map<string, IndexedCity[]>();

export function listCountries(): CountryOption[] {
  countryCache ??= Country.getAllCountries()
    .map((c) => ({ code: c.isoCode, name: c.name, currency: c.currency }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return countryCache;
}

export function isValidCountry(code: string): boolean {
  return /^[A-Z]{2}$/.test(code) && Country.getCountryByCode(code) !== undefined;
}

// Lowercase and strip accents, so "sao paulo" finds "São Paulo".
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Loaded once per country, then reused for every search.
function loadCities(countryCode: string): IndexedCity[] {
  const cached = cityIndex.get(countryCode);
  if (cached) return cached;

  const regions = new Map(State.getStatesOfCountry(countryCode).map((s) => [s.isoCode, s.name]));

  const cities = (City.getCitiesOfCountry(countryCode) ?? [])
    .map((c) => ({
      name: c.name,
      region: regions.get(c.stateCode) ?? null,
      latitude: Number(c.latitude),
      longitude: Number(c.longitude),
      key: normalize(c.name),
    }))
    .filter((c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude));

  cityIndex.set(countryCode, cities);
  return cities;
}

// Cities that start with the query come first, then cities that contain it.
export function searchCities(countryCode: string, query: string, limit = 8): CityResult[] {
  const q = normalize(query);
  if (q.length < 2 || !isValidCountry(countryCode)) return [];

  const startsWith: IndexedCity[] = [];
  const contains: IndexedCity[] = [];

  for (const city of loadCities(countryCode)) {
    if (city.key.startsWith(q)) startsWith.push(city);
    else if (city.key.includes(q)) contains.push(city);
    if (startsWith.length >= limit) break;
  }

  return [...startsWith, ...contains]
    .slice(0, limit)
    .map(({ name, region, latitude, longitude }) => ({
      name,
      region,
      latitude,
      longitude,
    }));
}

// The server decides the timezone. A browser-supplied timezone is never trusted.
export function resolveTimezone(input: {
  country: string;
  latitude?: number;
  longitude?: number;
}): string {
  const allowed = (Country.getCountryByCode(input.country)?.timezones ?? []).map((t) => t.zoneName);

  if (input.latitude !== undefined && input.longitude !== undefined) {
    try {
      const zone = tzlookup(input.latitude, input.longitude);
      // Only accept a zone that really belongs to the chosen country.
      if (allowed.length === 0 || allowed.includes(zone)) return zone;
    } catch {
      // Coordinates out of range: fall through to the country default.
    }
  }

  return allowed[0] ?? "UTC";
}
