"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/core/auth/session";
import type { FormState } from "@/core/forms";
import { setActiveBusinessId } from "./active-business";
import { createBusinessSchema } from "./schema";
import { createBusiness } from "./service";

export async function createBusinessAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = createBusinessSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const business = await createBusiness(user.id, parsed.data);
  await setActiveBusinessId(business.id);

  // redirect() works by throwing, so nothing after it runs.
  redirect("/dashboard");
}
