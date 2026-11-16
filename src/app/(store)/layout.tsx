// Store styles, currency and Shopify tracking for every storefront page.
// Nothing here may read cookies/headers: that would make every page dynamic. Visitor-specific data (market, cart,
// customer) arrives from /api/session in the browser, see StoreProviders.
import "leaflet/dist/leaflet.css";
import "./design.css";
import { StoreProviders } from "@/components/StoreProviders";
import { buildCurrencyOptions, BASE_CURRENCY } from "@/lib/currency";
import { getCountryCurrencies } from "@/lib/shopify";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const countryCurrencies = await getCountryCurrencies().catch(() => ({ AE: BASE_CURRENCY }) as Record<string, string>);
  return <StoreProviders defaultOptions={buildCurrencyOptions("AE", null, countryCurrencies)}>{children}</StoreProviders>;
}
