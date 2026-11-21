import { z } from "zod";

function isValidTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

export const createBusinessSchema = z.object({
  name: z.string().trim().min(2, "Enter your business name").max(80),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .refine((c) => Intl.supportedValuesOf("currency").includes(c), "Choose a currency"),
  timezone: z.string().trim().refine(isValidTimezone, "Choose a timezone"),
});

export type CreateBusinessInput = z.infer<typeof createBusinessSchema>;
