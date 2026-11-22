import { z } from "zod";
import { isValidCountry } from "./location";

// Hidden form fields arrive as text. Empty means "not provided".
function optionalCoordinate(min: number, max: number) {
  return z.preprocess(
    (value) => (value === "" || value === null || value === undefined ? undefined : Number(value)),
    z.number().min(min).max(max).optional(),
  );
}

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2, "Enter your business name").max(80),
  country: z.string().trim().toUpperCase().refine(isValidCountry, "Choose a country"),
  city: z.string().trim().min(2, "Enter your city").max(100),
  latitude: optionalCoordinate(-90, 90),
  longitude: optionalCoordinate(-180, 180),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .refine((c) => Intl.supportedValuesOf("currency").includes(c), "Choose a currency"),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
