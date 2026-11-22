"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Combobox, type ComboboxOption } from "@/components/ui/combobox";
import { Field } from "@/components/ui/field";
import { FormError } from "@/components/ui/form-error";
import { SelectField } from "@/components/ui/select-field";
import type { FormState } from "@/core/forms";
import { createBusinessAction } from "../actions";
import type { CityResult, CountryOption } from "../location";

type Option = { value: string; label: string };

const initialState: FormState = {};

// Lowercase and strip accents, so "cote d'ivoire" matches "Côte d'Ivoire".
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function filterCountries(countries: CountryOption[], query: string) {
  const q = normalize(query);
  if (!q) return countries;
  const starts = countries.filter((c) => normalize(c.name).startsWith(q));
  const rest = countries.filter(
    (c) => !normalize(c.name).startsWith(q) && normalize(c.name).includes(q),
  );
  return [...starts, ...rest];
}

export function CreateBusinessForm({
  countries,
  currencies,
}: {
  countries: CountryOption[];
  currencies: Option[];
}) {
  const [state, formAction, pending] = useActionState(createBusinessAction, initialState);

  const [countryQuery, setCountryQuery] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [pickedCity, setPickedCity] = useState<CityResult | null>(null);
  const [cityResults, setCityResults] = useState<CityResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [currency, setCurrency] = useState("");

  const country = countries.find((c) => c.code === countryCode);
  const cityText = cityQuery.trim();

  // --- Country ---
  const showAllCountries = country !== undefined && countryQuery === country.name;
  const countryOptions: ComboboxOption[] = (
    showAllCountries ? countries : filterCountries(countries, countryQuery)
  ).map((c) => ({ key: c.code, label: c.name, hint: c.currency || undefined }));

  function selectCountry(option: ComboboxOption) {
    const picked = countries.find((c) => c.code === option.key);
    if (!picked) return;
    setCountryCode(picked.code);
    setCountryQuery(picked.name);
    setCityQuery("");
    setPickedCity(null);
    setCityResults([]);
    // Currency follows the country, and can still be changed below.
    if (currencies.some((c) => c.value === picked.currency)) setCurrency(picked.currency);
  }

  function changeCountryQuery(value: string) {
    setCountryQuery(value);
    if (country && value !== country.name) {
      setCountryCode("");
      setCityQuery("");
      setPickedCity(null);
      setCityResults([]);
    }
  }

  // --- City (searched on the server as the user types) ---
  const canSearch = Boolean(countryCode) && !pickedCity && cityText.length >= 2;

  useEffect(() => {
    if (!canSearch) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(
          `/api/cities?country=${countryCode}&q=${encodeURIComponent(cityText)}`,
          { signal: controller.signal },
        );
        if (!response.ok) throw new Error("Search failed");
        const data = (await response.json()) as { cities: CityResult[] };
        if (!controller.signal.aborted) setCityResults(data.cities);
      } catch {
        if (!controller.signal.aborted) setCityResults([]);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [canSearch, countryCode, cityText]);

  const visibleCities = canSearch ? cityResults : [];
  const isSearching = canSearch && searching;

  // If the typed name exactly matches a result, treat it as picked.
  const chosenCity =
    pickedCity ?? visibleCities.find((c) => normalize(c.name) === normalize(cityText)) ?? null;

  const cityOptions: ComboboxOption[] = visibleCities.map((c, index) => ({
    key: String(index),
    label: c.name,
    hint: c.region ?? undefined,
  }));

  function selectCity(option: ComboboxOption) {
    const picked = visibleCities[Number(option.key)];
    if (!picked) return;
    setPickedCity(picked);
    setCityQuery(picked.name);
  }

  function changeCityQuery(value: string) {
    setCityQuery(value);
    if (pickedCity && value !== pickedCity.name) setPickedCity(null);
  }

  let cityHelper: string | undefined;
  if (chosenCity) {
    cityHelper = `Timezone: ${chosenCity.timezone}`;
  } else if (canSearch && !isSearching && visibleCities.length === 0) {
    cityHelper = `We could not find that city. We will use the main timezone for ${country?.name ?? "your country"}, and you can change it later in Settings.`;
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.error ? <FormError>{state.error}</FormError> : null}

      <Field
        label="Business name"
        name="name"
        type="text"
        autoComplete="organization"
        placeholder="For example, Corner Market"
        defaultValue={state.values?.name}
        error={state.fieldErrors?.name?.[0]}
      />

      <Combobox
        label="Country"
        placeholder="Search for your country"
        query={countryQuery}
        onQueryChange={changeCountryQuery}
        options={countryOptions}
        onSelect={selectCountry}
        error={state.fieldErrors?.country?.[0]}
      />

      <Combobox
        label="City"
        placeholder={countryCode ? "Start typing your city" : "Choose a country first"}
        query={cityQuery}
        onQueryChange={changeCityQuery}
        options={cityOptions}
        onSelect={selectCity}
        loading={isSearching}
        disabled={!countryCode}
        helper={cityHelper}
        error={state.fieldErrors?.city?.[0]}
      />

      <SelectField
        label="Currency"
        name="currency"
        placeholder="Select your currency"
        options={currencies}
        value={currency}
        onChange={setCurrency}
        helper="Based on your country. Change it if you sell in another currency."
        error={state.fieldErrors?.currency?.[0]}
      />

      <input type="hidden" name="country" value={countryCode} />
      <input type="hidden" name="city" value={chosenCity?.name ?? cityText} />
      <input type="hidden" name="latitude" value={chosenCity ? String(chosenCity.latitude) : ""} />
      <input
        type="hidden"
        name="longitude"
        value={chosenCity ? String(chosenCity.longitude) : ""}
      />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating…" : "Create business"}
      </Button>
    </form>
  );
}
