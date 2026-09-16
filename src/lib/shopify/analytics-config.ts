// Central Shopify analytics identifiers for HHARA headless storefront.
// Shop ID and channel ID are not secrets — they appear in browser analytics payloads.

export const SHOPIFY_CONFIG = {
  shopId: "gid://shopify/Shop/72899690678",
  storefrontId: "172869484726", // "My Store Headless" Headless channel numeric ID
  shopDomain: "cuxtmt-tw.myshopify.com",
  currency: "AED" as const,
  acceptedLanguage: "EN" as const,
  // Cookie domain: shared root between storefront and checkout.
  // Using window.location.hostname at runtime so it works on localhost and production.
  checkoutDomain: process.env.NEXT_PUBLIC_CHECKOUT_DOMAIN || "cuxtmt-tw.myshopify.com",
} as const;
