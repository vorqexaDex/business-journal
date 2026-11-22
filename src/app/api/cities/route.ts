import { NextResponse } from "next/server";
import { auth } from "@/core/auth/auth";
import { isValidCountry, searchCities } from "@/modules/businesses";

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const country = (searchParams.get("country") ?? "").toUpperCase();
  const query = (searchParams.get("q") ?? "").slice(0, 60);

  if (!isValidCountry(country)) {
    return NextResponse.json({ error: "Unknown country" }, { status: 400 });
  }

  return NextResponse.json({ cities: searchCities(country, query) });
}
