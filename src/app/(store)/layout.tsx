// Store-only styles and Shopify tracking live here so the coming-soon page at "/" doesn't pay for them.
import "leaflet/dist/leaflet.css";
import "./design.css";
import { ShopifyWebPixels } from "@/components/analytics/ShopifyWebPixels";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { SWITCHER_COUNTRIES, getRates } from "@/lib/currency";
import { getVisitorContext } from "@/lib/visitor";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [{ country, currency, ipCountry, countryCurrencies }, rates] = await Promise.all([getVisitorContext(), getRates()]);

  // One switcher entry per currency: the current country first, then the visitor's own, then the defaults
  const options: { country: string; currency: string }[] = [];
  for (const c of [country, ipCountry, ...SWITCHER_COUNTRIES]) {
    const cur = c && countryCurrencies[c];
    if (cur && !options.some((o) => o.currency === cur)) options.push({ country: c, currency: cur });
  }

  return (
    <CurrencyProvider currency={currency} options={options} rate={rates[currency] ?? 1}>
      <ShopifyWebPixels currency={currency} />
      {children}
    </CurrencyProvider>
  );
}
