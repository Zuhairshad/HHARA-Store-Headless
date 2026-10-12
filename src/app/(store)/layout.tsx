// Store-only styles and Shopify tracking live here so the coming-soon page at "/" doesn't pay for them.
import "leaflet/dist/leaflet.css";
import "./design.css";
import { cookies, headers } from "next/headers";
import { ShopifyWebPixels } from "@/components/analytics/ShopifyWebPixels";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { CURRENCY_COOKIE, currencyForCountry, getRates, resolveCurrency } from "@/lib/currency";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [cookieStore, headerStore, rates] = await Promise.all([cookies(), headers(), getRates()]);
  const localCurrency = resolveCurrency(currencyForCountry(headerStore.get("x-vercel-ip-country")), rates);
  // A currency the visitor picked wins over the one guessed from their IP country.
  const chosen = cookieStore.get(CURRENCY_COOKIE)?.value;
  const currency = chosen && rates[chosen] ? chosen : localCurrency;

  return (
    <CurrencyProvider initialCurrency={currency} localCurrency={localCurrency} rates={rates}>
      <ShopifyWebPixels />
      {children}
    </CurrencyProvider>
  );
}
