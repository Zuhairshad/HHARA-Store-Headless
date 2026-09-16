"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useShopifyCookies } from "@shopify/hydrogen-react";
import { getConsentPreferences, subscribeConsent } from "@/lib/analytics/consent";
import { SHOPIFY_CONFIG } from "@/lib/shopify/analytics-config";

function callSetTrackingConsent(analyticsAllowed: boolean, marketingAllowed: boolean) {
  try {
    window.Shopify?.customerPrivacy?.setTrackingConsent(
      {
        analyticsAllowed,
        marketingAllowed,
        saleOfDataAllowed: marketingAllowed,
        headlessStorefront: true,
        checkoutRootDomain: "cuxtmt-tw.myshopify.com",
        storefrontRootDomain: "site.hhara.com",
        storefrontAccessToken: "3685b9997a838dde0680bcad84bad603",
      },
      (err) => {
        if (err) console.warn("[analytics] setTrackingConsent error:", err);
      }
    );
  } catch (err) {
    console.warn("[analytics] setTrackingConsent threw:", err);
  }
}

export function ShopifyWebPixels() {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(() => {
    const prefs = getConsentPreferences();
    // Undecided visitors treated as consented — matches behaviour for non-GDPR regions (UAE).
    return !prefs.decided || prefs.analytics;
  });

  useEffect(() => {
    return subscribeConsent((prefs) => {
      const analytics = !prefs.decided || prefs.analytics;
      const marketing = !prefs.decided || prefs.marketing;
      setHasAnalyticsConsent(analytics);
      // Re-notify Shopify when consent changes
      if (window.Shopify?.customerPrivacy) {
        callSetTrackingConsent(analytics, marketing);
      }
    });
  }, []);

  // Load Customer Privacy API then call setTrackingConsent.
  // Without this Shopify's analytics pipeline doesn't recognise headless storefront traffic.
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js";
    script.async = true;
    script.onload = () => {
      const prefs = getConsentPreferences();
      const analytics = !prefs.decided || prefs.analytics;
      const marketing = !prefs.decided || prefs.marketing;
      callSetTrackingConsent(analytics, marketing);
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // No checkoutDomain — checkout is on cuxtmt-tw.myshopify.com (different root from site.hhara.com).
  // Passing it would make useShopifyCookies compute ".com" as the shared root, which browsers
  // reject as a public suffix, preventing _shopify_y/_shopify_s from being set at all.
  // The proxy at /api/unstable/graphql.json sets cookies directly instead.
  useShopifyCookies({
    hasUserConsent: hasAnalyticsConsent,
    fetchTrackingValues: true,
  });

  // Monorail site-abandonment beacon — fires on tab/page close
  useEffect(() => {
    const sessionStart = Date.now();

    function handlePageHide() {
      try {
        if (!getConsentPreferences().analytics) return;

        navigator.sendBeacon(
          "https://monorail-edge.shopifysvc.com/v1/produce",
          JSON.stringify({
            schema_id: "online_store_buyer_site_abandonment/1.1",
            payload: {
              shop_id: "72899690678",
              url: window.location.href,
              referrer: document.referrer || "",
              time_on_page: Math.round((Date.now() - sessionStart) / 1000),
              navigation_type: "navigate",
            },
            metadata: {
              event_created_at_ms: Date.now(),
              is_persistent_cookie: false,
            },
          })
        );
      } catch {
        // non-critical
      }
    }

    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

  return (
    <>
      {/* Initialise window.Shopify synchronously before any other scripts.
          The analytics shim lets WPM and other subscribers receive storefront events. */}
      <Script
        id="shopify-globals-init"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.Shopify = window.Shopify || {};
            window.Shopify.shop = '${SHOPIFY_CONFIG.shopDomain}';
            window.Shopify.shopId = '72899690678';
            window.Shopify.currency = { active: 'AED', rate: '1.0' };
            (function() {
              var q = [];
              window.Shopify.analytics = {
                replayQueue: q,
                publish: function(name, payload, opts) {
                  q.push([name, payload, opts]);
                  try {
                    window.dispatchEvent(new CustomEvent('shopify:' + name, {
                      detail: { payload: payload, options: opts },
                      bubbles: true
                    }));
                  } catch(e) {}
                }
              };
            })();
          `,
        }}
      />

      {/* Shopify Web Pixels Manager bundle.
          In headless, the WPM operates without a Liquid-injected session so
          Shopify Admin Online Store session reports do not count this traffic.
          GA4, Meta Pixel, and sendShopifyAnalytics are the authoritative sources. */}
      <Script
        id="shopify-wpm-bundle"
        strategy="afterInteractive"
        src="https://extensions.shopifycdn.com/cdn/shopifycloud/web-pixels-manager/0.0.334/bundle.js"
      />
    </>
  );
}
