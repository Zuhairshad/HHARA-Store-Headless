// Display-only currency conversion. Shopify checkout always charges in AED
// (our payment gateway is single-currency), so these prices are indicative.

export const BASE_CURRENCY = "AED";

/** Currencies always offered in the switcher; the visitor's own currency is added to these. */
export const MAIN_CURRENCIES = ["AED", "USD", "GBP", "EUR", "SAR", "KWD", "QAR", "BHD", "OMR"];

export const CURRENCY_COOKIE = "hhara_currency";

// ISO 4217 currency → ISO 3166 countries that use it.
const CURRENCY_COUNTRIES: Record<string, string> = {
  AED: "AE", AFN: "AF", ALL: "AL", AMD: "AM", AOA: "AO", ARS: "AR",
  AUD: "AU CX CC HM KI NR NF TV", AWG: "AW", AZN: "AZ", BAM: "BA", BBD: "BB",
  BDT: "BD", BGN: "BG", BHD: "BH", BIF: "BI", BMD: "BM", BND: "BN", BOB: "BO",
  BRL: "BR", BSD: "BS", BTN: "BT", BWP: "BW", BYN: "BY", BZD: "BZ", CAD: "CA",
  CDF: "CD", CHF: "CH LI", CLP: "CL", CNY: "CN", COP: "CO", CRC: "CR", CUP: "CU",
  CVE: "CV", CZK: "CZ", DJF: "DJ", DKK: "DK GL FO", DOP: "DO", DZD: "DZ", EGP: "EG",
  ERN: "ER", ETB: "ET",
  EUR: "AT BE HR CY EE FI FR DE GR IE IT LV LT LU MT NL PT SK SI ES MC VA SM AD ME XK GF GP MQ YT RE PM BL MF AX TF",
  FJD: "FJ", FKP: "FK", GBP: "GB GS", GEL: "GE", GGP: "GG", GHS: "GH", GIP: "GI",
  GMD: "GM", GNF: "GN", GTQ: "GT", GYD: "GY", HKD: "HK", HNL: "HN", HTG: "HT",
  HUF: "HU", IDR: "ID", ILS: "IL PS", IMP: "IM", INR: "IN", IQD: "IQ", IRR: "IR",
  ISK: "IS", JEP: "JE", JMD: "JM", JOD: "JO", JPY: "JP", KES: "KE", KGS: "KG",
  KHR: "KH", KMF: "KM", KRW: "KR", KWD: "KW", KYD: "KY", KZT: "KZ", LAK: "LA",
  LBP: "LB", LKR: "LK", LRD: "LR", LSL: "LS", LYD: "LY", MAD: "MA EH", MDL: "MD",
  MGA: "MG", MKD: "MK", MMK: "MM", MNT: "MN", MOP: "MO", MRU: "MR", MUR: "MU",
  MVR: "MV", MWK: "MW", MXN: "MX", MYR: "MY", MZN: "MZ", NAD: "NA", NGN: "NG",
  NIO: "NI", NOK: "NO SJ BV", NPR: "NP", NZD: "NZ CK NU PN TK", OMR: "OM",
  PAB: "PA", PEN: "PE", PGK: "PG", PHP: "PH", PKR: "PK", PLN: "PL", PYG: "PY",
  QAR: "QA", RON: "RO", RSD: "RS", RUB: "RU", RWF: "RW", SAR: "SA", SBD: "SB",
  SCR: "SC", SDG: "SD", SEK: "SE", SGD: "SG", SHP: "SH", SLE: "SL", SOS: "SO",
  SRD: "SR", SSP: "SS", STN: "ST", SYP: "SY", SZL: "SZ", THB: "TH", TJS: "TJ",
  TMT: "TM", TND: "TN", TOP: "TO", TRY: "TR", TTD: "TT", TWD: "TW", TZS: "TZ",
  UAH: "UA", UGX: "UG", UYU: "UY", UZS: "UZ", VES: "VE", VND: "VN", VUV: "VU",
  WST: "WS", XAF: "CM CF TD CG GQ GA", XCD: "AG DM GD KN LC VC AI MS",
  XCG: "CW SX", XOF: "BJ BF CI GW ML NE SN TG", XPF: "PF NC WF", YER: "YE",
  ZAR: "ZA", ZMW: "ZM", ZWG: "ZW",
  USD: "US EC SV PR GU AS MP VI UM TC VG BQ IO FM MH PW TL",
};

const COUNTRY_CURRENCY: Record<string, string> = Object.fromEntries(
  Object.entries(CURRENCY_COUNTRIES).flatMap(([cur, countries]) => countries.split(" ").map((c) => [c, cur]))
);

// Used if the rates API is unreachable. AED is pegged to USD at 3.6725.
const FALLBACK_RATES: Record<string, number> = {
  AED: 1, USD: 0.2723, GBP: 0.2057, EUR: 0.2431, SAR: 1.0211,
  KWD: 0.0845, QAR: 0.9912, BHD: 0.1024, OMR: 0.1047,
};

export function isCurrencyCode(value: unknown): value is string {
  return typeof value === "string" && /^[A-Z]{3}$/.test(value);
}

/** The currency used in a visitor's country; AED when the country is unknown. */
export function currencyForCountry(country: string | null | undefined): string {
  if (!country) return BASE_CURRENCY;
  return COUNTRY_CURRENCY[country.toUpperCase()] ?? "USD";
}

/** AED → X rates for every currency we can get, refreshed once a day. Server-only. */
export async function getRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/AED", { next: { revalidate: 86400 } });
    if (!res.ok) return FALLBACK_RATES;
    const data = await res.json();
    if (data?.result !== "success") return FALLBACK_RATES;
    const rates: Record<string, number> = { ...FALLBACK_RATES };
    for (const [code, value] of Object.entries(data.rates ?? {})) {
      const r = Number(value);
      if (isCurrencyCode(code) && r > 0) rates[code] = r;
    }
    rates.AED = 1;
    return rates;
  } catch {
    return FALLBACK_RATES;
  }
}

/** Falls back to USD (or AED) when we have no rate for the wanted currency. */
export function resolveCurrency(wanted: string, rates: Record<string, number>): string {
  if (rates[wanted]) return wanted;
  return rates.USD ? "USD" : BASE_CURRENCY;
}

/** Formats an AED amount in the given currency, e.g. "AED 1,200", "$327", "PKR 27,450". */
export function formatPrice(aed: number, currency: string, rate: number): string {
  if (currency === BASE_CURRENCY) return `AED ${aed.toLocaleString()}`;
  const amount = Math.round(aed * rate);
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Intl doesn't know a few newer or local-only codes (e.g. GGP, ZWG).
    return `${currency} ${amount.toLocaleString("en")}`;
  }
}
