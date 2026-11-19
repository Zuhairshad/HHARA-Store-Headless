// Central Shopify identifiers for the HHARA headless storefront. None of these are secrets: they all appear in browser
// analytics payloads. Each can be overridden by a NEXT_PUBLIC_* env var; the defaults are the live store's values.

const shopIdNumeric = process.env.NEXT_PUBLIC_SHOPIFY_SHOP_ID || "72899690678";

export const SHOPIFY_CONFIG = {
  shopId: `gid://shopify/Shop/${shopIdNumeric}`,
  shopIdNumeric,
  /** "My Store Headless" Headless sales channel (storefront) numeric ID. */
  storefrontId: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ID || "172869484726",
  /** The .myshopify.com domain: Storefront API host and the first-party monorail endpoint for sendShopifyAnalytics. */
  shopDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "cuxtmt-tw.myshopify.com",
  /** Public Storefront API token (Headless channel). Public by design; used by the Customer Privacy API. */
  storefrontAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN || "3685b9997a838dde0680bcad84bad603",
  /**
   * Where Shopify checkout lives (the store's primary domain). It shares the root domain with www.hhara.com, so the
   * tracking cookies are written on .hhara.com and checkout sees the same visitor as the storefront.
   */
  checkoutDomain: process.env.NEXT_PUBLIC_CHECKOUT_DOMAIN || "checkout.hhara.com",
  /** Root domain shared by storefront and checkout. */
  storefrontRootDomain: process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN || "hhara.com",
  currency: "AED" as const,
  acceptedLanguage: "EN" as const,
} as const;

/** Cookie Domain attribute for tracking cookies on a request to `host`: the shared root, or host-only elsewhere. */
export function trackingCookieDomain(host: string | null | undefined): string | undefined {
  const h = (host || "").split(":")[0].toLowerCase();
  const root = SHOPIFY_CONFIG.storefrontRootDomain;
  return h === root || h.endsWith(`.${root}`) ? `.${root}` : undefined;
}
