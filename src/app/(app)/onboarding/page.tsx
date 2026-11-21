import { redirect } from "next/navigation";
import { requireUser } from "@/core/auth/session";
import { userHasBusiness } from "@/modules/businesses";
import { CreateBusinessForm } from "@/modules/businesses/components/create-business-form";

export const metadata = { title: "Set up your business" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (await userHasBusiness(user.id)) redirect("/dashboard");

  const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });
  const currencies = Intl.supportedValuesOf("currency").map((code) => ({
    value: code,
    label: `${code} · ${currencyNames.of(code) ?? code}`,
  }));

  const zones = Intl.supportedValuesOf("timeZone").filter((z) => z !== "UTC");
  const timezones = ["UTC", ...zones].map((zone) => ({
    value: zone,
    label: zone.replaceAll("_", " "),
  }));

  return (
    <main className="mx-auto max-w-sm space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Set up your business</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          This controls how your money and dates are shown. You can change the name later.
        </p>
      </div>
      <CreateBusinessForm currencies={currencies} timezones={timezones} />
    </main>
  );
}
