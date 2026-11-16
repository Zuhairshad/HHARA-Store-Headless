import { NextResponse } from "next/server";
import { getVisitorContext } from "@/lib/visitor";
import { BASE_CURRENCY, buildCurrencyOptions, getRates } from "@/lib/currency";
import { dialCountryOrDefault } from "@/lib/dial-codes";
import { getCurrentCart } from "@/lib/cart-actions";
import { getCurrentCustomer } from "@/lib/customer-actions";
import { getStorefrontProducts } from "@/lib/products";
import type { StoreSession } from "@/lib/session";

// Public pages are static, so everything specific to the visitor (market, cart, signed-in customer) comes from here.
export const dynamic = "force-dynamic";

export async function GET() {
  const [{ country, currency, ipCountry, geoCountry, countryCurrencies }, rates] = await Promise.all([getVisitorContext(), getRates()]);

  // Pages are rendered in AED, so only visitors in another currency need the product list again
  const [cart, customer, products] = await Promise.all([
    getCurrentCart().catch((e) => { console.warn("[session] cart failed:", e); return null; }),
    getCurrentCustomer().catch((e) => { console.warn("[session] customer failed:", e); return null; }),
    currency !== BASE_CURRENCY ? getStorefrontProducts(country).catch(() => []) : Promise.resolve([]),
  ]);

  const session: StoreSession = {
    country,
    currency,
    options: buildCurrencyOptions(country, ipCountry, countryCurrencies),
    rate: rates[currency] ?? 1,
    phoneCountry: dialCountryOrDefault(geoCountry),
    cart,
    customer,
    ...(products.length ? { products } : {}),
  };
  return NextResponse.json(session, { headers: { "Cache-Control": "private, no-store" } });
}
