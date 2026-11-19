"use client";

import { useState, useEffect } from "react";
import { useShopifyCookies } from "@shopify/hydrogen-react";
import { subscribeConsent } from "@/lib/analytics/consent";
import { markShopifyTrackingReady, setShopifyAnalyticsCurrency, shopifyConsent } from "@/lib/analytics/providers/shopify";
import { SHOPIFY_CONFIG } from "@/lib/shopify/analytics-config";

// Shopify's side of headless tracking:
// 1. Customer Privacy API: tells Shopify the visitor's consent for this headless storefront + its checkout domain.
// 2. useShopifyCookies: fetches Shopify's visitor/session tokens through /api/unstable/graphql.json and writes
//    _shopify_y / _shopify_s on .hhara.com (the root shared with checkout.hhara.com), so the visit and the checkout are
//    one session in Shopify Analytics and orders are attributed to the Headless channel visit.
// Storefront events themselves are sent by lib/analytics/providers/shopify.ts.

function callSetTrackingConsent() {
  const { analyticsAllowed, marketingAllowed } = shopifyConsent();
  try {
    window.Shopify?.customerPrivacy?.setTrackingConsent(
      {
        analytics: analyticsAllowed,
        marketing: marketingAllowed,
        preferences: analyticsAllowed,
        sale_of_data: marketingAllowed,
        headlessStorefront: true,
        checkoutRootDomain: SHOPIFY_CONFIG.checkoutDomain,
        storefrontRootDomain: SHOPIFY_CONFIG.storefrontRootDomain,
        storefrontAccessToken: SHOPIFY_CONFIG.storefrontAccessToken,
      },
      (result) => {
        if (result?.error) console.warn("[analytics] setTrackingConsent error:", result.error);
      }
    );
  } catch (err) {
    console.warn("[analytics] setTrackingConsent threw:", err);
  }
}

/** Earlier builds wrote _shopify_y/_s host-only on www; remove those so only the shared .hhara.com pair remains. */
function dropHostOnlyCookies() {
  if (!window.location.hostname.endsWith(SHOPIFY_CONFIG.storefrontRootDomain)) return;
  for (const name of ["_shopify_y", "_shopify_s"]) document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
}

export function ShopifyWebPixels({ currency = "AED" }: { currency?: string }) {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(() => shopifyConsent().analyticsAllowed);

  useEffect(() => setShopifyAnalyticsCurrency(currency), [currency]);

  useEffect(() => {
    return subscribeConsent(() => {
      setHasAnalyticsConsent(shopifyConsent().analyticsAllowed);
      if (window.Shopify?.customerPrivacy) callSetTrackingConsent();
    });
  }, []);

  // Load Shopify's Customer Privacy API, then report consent. Without it Shopify doesn't recognise headless traffic.
  useEffect(() => {
    dropHostOnlyCookies();
    const script = document.createElement("script");
    script.src = "https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js";
    script.async = true;
    script.onload = callSetTrackingConsent;
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  const cookiesReady = useShopifyCookies({
    hasUserConsent: hasAnalyticsConsent,
    // Shared root of www.hhara.com and checkout.hhara.com → cookies on .hhara.com (host-only on localhost / vercel.app)
    checkoutDomain: SHOPIFY_CONFIG.checkoutDomain,
    fetchTrackingValues: true,
  });

  useEffect(() => {
    if (cookiesReady) markShopifyTrackingReady();
  }, [cookiesReady]);

  return null;
}
