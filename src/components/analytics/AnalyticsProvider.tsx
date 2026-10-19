"use client";

import React, { useEffect, useState, Suspense } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { getConsentPreferences, subscribeConsent } from "@/lib/analytics/consent";
import { captureAttribution } from "@/lib/analytics/attribution";
import { trackEvent } from "@/lib/analytics";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GADS_ID = process.env.NEXT_PUBLIC_GADS_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only fire standard page_view for standalone pages or initial visit
    // Internal HharaApp route changes will be tracked via internal events
    const path = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    const title = typeof document !== "undefined" ? document.title : "HHARA";

    trackEvent({
      name: "page_viewed",
      payload: {
        page_title: title,
        page_location: typeof window !== "undefined" ? window.location.href : "",
        page_path: path,
        page_type: pathname === "/" ? "home" : pathname.replace(/^\//, ""),
      },
    });
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState(() => getConsentPreferences());

  useEffect(() => {
    // Capture attribution on initial load
    captureAttribution();

    // Subscribe to consent changes
    const unsubscribe = subscribeConsent((updated) => {
      setConsent(updated);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <RouteChangeListener />
      </Suspense>

      {/* ─── Google Consent Mode v2 + Tag Initialization ─── */}
      {GA4_ID && (
        <>
          <Script
            id="google-consent-mode-init"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                
                // Set default denied consent mode
                gtag('consent', 'default', {
                  'analytics_storage': '${consent.analytics ? "granted" : "denied"}',
                  'ad_storage': '${consent.marketing ? "granted" : "denied"}',
                  'ad_user_data': '${consent.marketing ? "granted" : "denied"}',
                  'ad_personalization': '${consent.marketing ? "granted" : "denied"}',
                  'wait_for_update': 500
                });
              `,
            }}
          />
          <Script
            id="google-tag-js"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
          />
          <Script
            id="google-gtag-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                gtag('js', new Date());
                gtag('config', '${GA4_ID}', {
                  send_page_view: false, // Page views managed via RouteChangeListener / trackEvent
                  currency: 'AED'
                });
                ${GADS_ID ? `gtag('config', '${GADS_ID}', { send_page_view: false });` : ""}
              `,
            }}
          />
        </>
      )}

      {/* ─── Meta Pixel (Loaded only when Marketing Consent granted) ─── */}
      {META_PIXEL_ID && consent.marketing && (
        <Script
          id="meta-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('consent', 'grant');
            `,
          }}
        />
      )}

      {/* ─── TikTok Pixel (Loaded only when Marketing Consent granted) ─── */}
      {TIKTOK_PIXEL_ID && consent.marketing && (
        <Script
          id="tiktok-pixel-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('${TIKTOK_PIXEL_ID}');
                ttq.grantConsent();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {children}
    </>
  );
}
