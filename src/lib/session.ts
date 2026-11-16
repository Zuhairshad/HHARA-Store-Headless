// Shape of GET /api/session: everything that differs per visitor, fetched by the browser once after the
// (static, CDN-cached) page has loaded.
export type StoreSession = {
  country: string;
  currency: string;
  options: { country: string; currency: string }[];
  /** AED → currency rate, for the free-shipping threshold. */
  rate: number;
  /** Country phone fields start on. */
  phoneCountry: string;
  cart: any | null;
  customer: any | null;
  /** Only present when the visitor's currency isn't AED: the same products priced for their country. */
  products?: any[];
};
