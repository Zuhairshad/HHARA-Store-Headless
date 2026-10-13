// Prices are shown in the currency Shopify charges for the visitor's country (Shopify Markets),
// so the site and checkout always match. Countries whose currency our payment gateway can't
// charge in (e.g. Kuwait) are priced in AED by Shopify, and we show AED for them too.

export const BASE_CURRENCY = "AED";

/** Country the visitor picked in the currency switcher; wins over their IP country. */
export const COUNTRY_COOKIE = "hhara_country";

/** Countries always offered in the switcher (one per currency), plus the visitor's own. */
export const SWITCHER_COUNTRIES = ["AE", "US", "GB", "DE", "SA", "QA", "CA"];

/** Free international shipping threshold, in AED (matches the Shopify shipping rates). */
export const FREE_SHIPPING_AED = 1200;

/** AED → X rates, refreshed once a day. Only used to estimate the free-shipping threshold. Server-only. */
export async function getRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/AED", { next: { revalidate: 86400 } });
    if (!res.ok) return { AED: 1 };
    const data = await res.json();
    if (data?.result !== "success") return { AED: 1 };
    const rates: Record<string, number> = { AED: 1 };
    for (const [code, value] of Object.entries(data.rates ?? {})) {
      const r = Number(value);
      if (/^[A-Z]{3}$/.test(code) && r > 0) rates[code] = r;
    }
    return rates;
  } catch {
    return { AED: 1 };
  }
}

/** Formats an amount already in `currency`, e.g. "AED 1,200", "$100", "€89.95", "PKR 27,700". */
export function formatPrice(amount: number, currency: string): string {
  if (currency === BASE_CURRENCY) return `AED ${amount.toLocaleString("en")}`;
  const digits = Number.isInteger(Math.round(amount * 100) / 100) ? 0 : 2;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en", { maximumFractionDigits: digits })}`;
  }
}
