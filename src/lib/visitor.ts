import { cookies, headers } from "next/headers";
import { getCountryCurrencies } from "./shopify";
import { BASE_CURRENCY, COUNTRY_COOKIE } from "./currency";

export type VisitorContext = {
  /** Country we price and check out in (always one Shopify sells to). */
  country: string;
  /** Currency Shopify charges in for that country. */
  currency: string;
  /** Country Vercel located the visitor in, if Shopify sells there. */
  ipCountry: string | null;
  /** Country Vercel located the visitor in, whether or not Shopify sells there. */
  geoCountry: string | null;
  countryCurrencies: Record<string, string>;
};

/** Works out the visitor's country and currency for this request. Server-only. */
export async function getVisitorContext(): Promise<VisitorContext> {
  const [cookieStore, headerStore, countryCurrencies] = await Promise.all([
    cookies(),
    headers(),
    getCountryCurrencies().catch(() => ({ AE: BASE_CURRENCY }) as Record<string, string>),
  ]);
  const sells = (c: string | null | undefined): c is string => !!c && !!countryCurrencies[c];

  const raw = headerStore.get("x-vercel-ip-country")?.toUpperCase();
  const geoCountry = raw && /^[A-Z]{2}$/.test(raw) ? raw : null;
  const ipCountry = sells(geoCountry) ? geoCountry : null;
  const chosen = cookieStore.get(COUNTRY_COOKIE)?.value?.toUpperCase();
  const country = sells(chosen) ? chosen : ipCountry ?? "AE";

  return { country, currency: countryCurrencies[country] ?? BASE_CURRENCY, ipCountry, geoCountry, countryCurrencies };
}
