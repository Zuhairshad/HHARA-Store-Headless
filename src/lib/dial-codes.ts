// International dialling codes for the phone fields, keyed by ISO 3166-1 alpha-2 country.
// Keyed by country rather than code because several countries share one (+1 US/CA, +7 RU/KZ, +44 GB/JE…).

/** Shown at the top of the picker, in this order: the Gulf, then our other main markets. */
const PRIORITY = ["AE", "SA", "QA", "KW", "BH", "OM", "GB", "US", "CA", "PK", "IN"];

const CODES: Record<string, string> = {
  AF: "93", AL: "355", DZ: "213", AD: "376", AO: "244", AG: "1", AR: "54", AM: "374", AU: "61", AT: "43",
  AZ: "994", BS: "1", BH: "973", BD: "880", BB: "1", BY: "375", BE: "32", BZ: "501", BJ: "229", BT: "975",
  BO: "591", BA: "387", BW: "267", BR: "55", BN: "673", BG: "359", BF: "226", BI: "257", KH: "855", CM: "237",
  CA: "1", CV: "238", CF: "236", TD: "235", CL: "56", CN: "86", CO: "57", KM: "269", CG: "242", CD: "243",
  CR: "506", CI: "225", HR: "385", CU: "53", CY: "357", CZ: "420", DK: "45", DJ: "253", DM: "1", DO: "1",
  EC: "593", EG: "20", SV: "503", GQ: "240", ER: "291", EE: "372", SZ: "268", ET: "251", FJ: "679", FI: "358",
  FR: "33", GA: "241", GM: "220", GE: "995", DE: "49", GH: "233", GR: "30", GD: "1", GT: "502", GN: "224",
  GW: "245", GY: "592", HT: "509", HN: "504", HK: "852", HU: "36", IS: "354", IN: "91", ID: "62", IR: "98",
  IQ: "964", IE: "353", IL: "972", IT: "39", JM: "1", JP: "81", JO: "962", KZ: "7", KE: "254", KI: "686",
  KW: "965", KG: "996", LA: "856", LV: "371", LB: "961", LS: "266", LR: "231", LY: "218", LI: "423", LT: "370",
  LU: "352", MO: "853", MG: "261", MW: "265", MY: "60", MV: "960", ML: "223", MT: "356", MH: "692", MR: "222",
  MU: "230", MX: "52", FM: "691", MD: "373", MC: "377", MN: "976", ME: "382", MA: "212", MZ: "258", MM: "95",
  NA: "264", NR: "674", NP: "977", NL: "31", NZ: "64", NI: "505", NE: "227", NG: "234", KP: "850", MK: "389",
  NO: "47", OM: "968", PK: "92", PW: "680", PS: "970", PA: "507", PG: "675", PY: "595", PE: "51", PH: "63",
  PL: "48", PT: "351", PR: "1", QA: "974", RO: "40", RU: "7", RW: "250", KN: "1", LC: "1", VC: "1",
  WS: "685", SM: "378", ST: "239", SA: "966", SN: "221", RS: "381", SC: "248", SL: "232", SG: "65", SK: "421",
  SI: "386", SB: "677", SO: "252", ZA: "27", KR: "82", SS: "211", ES: "34", LK: "94", SD: "249", SR: "597",
  SE: "46", CH: "41", SY: "963", TW: "886", TJ: "992", TZ: "255", TH: "66", TL: "670", TG: "228", TO: "676",
  TT: "1", TN: "216", TR: "90", TM: "993", TV: "688", UG: "256", UA: "380", AE: "971", GB: "44", US: "1",
  UY: "598", UZ: "998", VU: "678", VA: "39", VE: "58", VN: "84", YE: "967", ZM: "260", ZW: "263",
};

export const DEFAULT_DIAL_COUNTRY = "AE";

/** "+92" for "PK", or undefined for a country we don't list. */
export function dialCode(country: string): string | undefined {
  const code = CODES[country];
  return code && `+${code}`;
}

/** The visitor's country if we list it, else the default. */
export function dialCountryOrDefault(country: string | null | undefined): string {
  return country && CODES[country] ? country : DEFAULT_DIAL_COUNTRY;
}

/** 🇵🇰 from "PK" (Windows shows the two letters instead, which still reads fine). */
function flag(country: string): string {
  return String.fromCodePoint(...[...country].map((c) => 0x1f1a5 + c.charCodeAt(0)));
}

/** Picker options: priority countries first, then the rest by dialling code. */
export const DIAL_OPTIONS: { country: string; label: string }[] = [
  ...PRIORITY,
  ...Object.keys(CODES)
    .filter((c) => !PRIORITY.includes(c))
    .sort((a, b) => Number(CODES[a]) - Number(CODES[b]) || a.localeCompare(b)),
].map((country) => ({ country, label: `${flag(country)} +${CODES[country]}` }));
