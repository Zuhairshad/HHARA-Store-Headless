"use client";

import { useState, useEffect } from "react";
import Script from "next/script";
import { useShopifyCookies } from "@shopify/hydrogen-react";
import { getConsentPreferences, subscribeConsent } from "@/lib/analytics/consent";
import { SHOPIFY_CONFIG } from "@/lib/shopify/analytics-config";

export function ShopifyWebPixels() {
  const [hasAnalyticsConsent, setHasAnalyticsConsent] = useState(() => {
    const prefs = getConsentPreferences();
    // Undecided visitors treated as consented — matches behaviour for non-GDPR regions (UAE).
    // For GDPR/strict regions, change this to: return prefs.decided && prefs.analytics
    return !prefs.decided || prefs.analytics;
  });

  useEffect(() => {
    return subscribeConsent((prefs) => {
      setHasAnalyticsConsent(!prefs.decided || prefs.analytics);
    });
  }, []);

  // Fetches from /api/unstable/graphql.json (same-origin proxy) so the browser
  // can read Server-Timing headers containing _shopify_y / _shopify_s visitor tokens.
  // getTrackingValues() in hydrogen-react reads those via PerformanceResourceTiming.serverTiming,
  // then sets the cookies used by sendShopifyAnalytics.
  // No checkoutDomain — checkout is on cuxtmt-tw.myshopify.com (different root from site.hhara.com).
  // Passing it would make useShopifyCookies compute ".com" as the shared root, which browsers
  // reject as a public suffix, preventing _shopify_y/_shopify_s from being set at all.
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
