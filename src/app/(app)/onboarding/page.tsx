import { redirect } from "next/navigation";
import { requireUser } from "@/core/auth/session";
import { listCountries, userHasBusiness } from "@/modules/businesses";
import { CreateBusinessForm } from "@/modules/businesses/components/create-business-form";

export const metadata = { title: "Set up your business" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (await userHasBusiness(user.id)) redirect("/dashboard");

  const countries = listCountries();

  const currencyNames = new Intl.DisplayNames(["en"], { type: "currency" });
  const currencies = Intl.supportedValuesOf("currency").map((code) => ({
    value: code,
    label: `${code} - ${currencyNames.of(code) ?? code}`,
  }));

  return (
    <main className="mx-auto w-full max-w-sm space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Set up your business</h1>
        <p className="text-muted text-sm">
          Tell us where you trade. We use it to set your currency and the right timezone for your
          sales and reports.
        </p>
      </div>
      <CreateBusinessForm countries={countries} currencies={currencies} />
    </main>
  );
}
